import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';

import { Resource } from '../../entities/resource.entity';
import { ResourceHttpMethod } from '../../entities/resource-http-method.entity';

export interface ResourceMatch {
  resource: Resource;
  resourceHttpMethod: ResourceHttpMethod;
  params: Record<string, string>;
}

interface CompiledPattern {
  resource: Resource;
  regex: RegExp;
  literalSegments: number;
}

/**
 * Service that matches incoming request paths to registered Resource entities.
 *
 * Converts resource templateUrl patterns (e.g. `/api/condominiums/{condominiumId}/goals`)
 * into regex patterns and matches them against incoming paths.
 *
 * Only considers resources with an external integration (integrationId IS NOT NULL).
 */
@Injectable()
export class ResourceMatcherService {
  private readonly logger = new Logger(ResourceMatcherService.name);
  private patterns: CompiledPattern[] = [];
  private lastLoadedAt = 0;
  private readonly cacheTtlMs = 60_000; // 1 minute

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  /**
   * Match a request path and HTTP method to a registered resource.
   *
   * @param path - The path after /ext/ (e.g. `/api/condominiums/42/goals`)
   * @param method - HTTP method (GET, POST, etc.)
   * @returns Match result with resource, httpMethod, and extracted params, or null
   */
  async match(path: string, method: string): Promise<ResourceMatch | null> {
    await this.ensureLoaded();

    const upperMethod = method.toUpperCase();

    for (const pattern of this.patterns) {
      const match = pattern.regex.exec(path);
      if (!match) continue;

      // Find the ResourceHttpMethod for the requested HTTP method
      const rhm = (pattern.resource.httpMethods ?? []).find(
        (m) => m.httpMethod?.method === upperMethod && m.isActive,
      );

      if (!rhm) continue;

      const params: Record<string, string> = {};
      if (match.groups) {
        for (const [key, value] of Object.entries(match.groups)) {
          if (value !== undefined) params[key] = value;
        }
      }

      return {
        resource: pattern.resource,
        resourceHttpMethod: rhm,
        params,
      };
    }

    return null;
  }

  /**
   * Force reload of resource patterns from the database.
   */
  async reload(): Promise<void> {
    const resources = await this.resourceRepository.find({
      where: { isActive: true, integrationId: Not(IsNull()) },
      relations: {
        httpMethods: { httpMethod: true },
        integration: true,
      },
    });

    this.patterns = resources
      .map((resource) => {
        const regex = this.buildPattern(resource.templateUrl);
        if (!regex) return null;

        const literalSegments = resource.templateUrl
          .split('/')
          .filter((s) => s && !s.startsWith('{'))
          .length;

        return { resource, regex, literalSegments } satisfies CompiledPattern;
      })
      .filter((p): p is CompiledPattern => p !== null)
      // Sort by specificity: more literal segments first
      .sort((a, b) => b.literalSegments - a.literalSegments);

    this.lastLoadedAt = Date.now();
    this.logger.log(`Loaded ${this.patterns.length} external resource patterns`);
  }

  private async ensureLoaded(): Promise<void> {
    if (Date.now() - this.lastLoadedAt > this.cacheTtlMs) {
      await this.reload();
    }
  }

  /**
   * Convert a templateUrl like `/api/condominiums/{condominiumId}/goals`
   * into a regex like `^\/api\/condominiums\/(?<condominiumId>[^\/]+)\/goals$`
   */
  private buildPattern(templateUrl: string): RegExp | null {
    try {
      // Escape regex special chars, then replace escaped {placeholder} with named groups
      const escaped = templateUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const withGroups = escaped.replace(
        /\\\{([^}]+)\\\}/g,
        '(?<$1>[^/]+)',
      );
      return new RegExp(`^${withGroups}$`);
    } catch (err) {
      this.logger.warn(
        `Failed to compile pattern for templateUrl "${templateUrl}": ${err}`,
      );
      return null;
    }
  }
}
