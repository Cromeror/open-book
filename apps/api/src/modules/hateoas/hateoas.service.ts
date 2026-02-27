import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { ResourceHttpMethod } from '../../entities/resource-http-method.entity';
import { ResourceHttpMethodLink, ParamMapping } from '../../entities/resource-http-method-link.entity';

const CACHE_TTL_MS = 60_000; // 1 minute

export interface ResolvedLink {
  rel: string;
  href: string;
}

export interface LinkConfig {
  rel: string;
  targetTemplateUrl: string;
  paramMappings: ParamMapping[];
}

/**
 * Loads outbound link configurations for a given resource+method combination.
 * Results are cached to avoid repeated DB queries on every request.
 *
 * Resolution logic:
 * 1. Look up the ResourceHttpMethod row for (resourceCode, httpMethod)
 * 2. Load its outboundLinks with the target ResourceHttpMethod + Resource
 * 3. Cache the result keyed by "resourceCode:httpMethod"
 */
@Injectable()
export class HateoasService {
  constructor(
    @InjectRepository(ResourceHttpMethod)
    private readonly rhmRepository: Repository<ResourceHttpMethod>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  /**
   * Returns link configs for a given resource+method.
   * Each config has the target templateUrl and paramMappings.
   */
  async getLinkConfigs(resourceCode: string, httpMethod: string): Promise<LinkConfig[]> {
    const cacheKey = `hateoas:${resourceCode}:${httpMethod}`;
    const cached = await this.cache.get<LinkConfig[]>(cacheKey);
    if (cached) return cached;

    const rhm = await this.rhmRepository
      .createQueryBuilder('rhm')
      .innerJoin('rhm.resource', 'r')
      .innerJoin('rhm.httpMethod', 'hm')
      .leftJoinAndSelect('rhm.outboundLinks', 'links')
      .leftJoinAndSelect('links.targetHttpMethod', 'targetRhm')
      .leftJoinAndSelect('targetRhm.resource', 'targetResource')
      .where('r.code = :resourceCode', { resourceCode })
      .andWhere('hm.method = :httpMethod', { httpMethod })
      .andWhere('r.isActive = true')
      .getOne();

    if (!rhm || !rhm.outboundLinks?.length) {
      await this.cache.set(cacheKey, [], CACHE_TTL_MS);
      return [];
    }

    const configs: LinkConfig[] = rhm.outboundLinks
      .filter((link) => link.isActive)
      .map((link) => ({
        rel: link.rel,
        targetTemplateUrl: link.targetHttpMethod.resource.templateUrl,
        paramMappings: link.paramMappings,
      }));

    await this.cache.set(cacheKey, configs, CACHE_TTL_MS);
    return configs;
  }

  /**
   * Resolves _links for a single response item.
   *
   * @param item            - The response item (e.g. a Goal object)
   * @param configs         - Link configs loaded from getLinkConfigs()
   * @param sessionContext  - Route params already known (e.g. { condominiumId: '...' })
   */
  resolveLinks(
    item: Record<string, unknown>,
    configs: LinkConfig[],
    sessionContext: Record<string, string>,
  ): Record<string, string> {
    const links: Record<string, string> = {};

    for (const config of configs) {
      let href = config.targetTemplateUrl;

      // Replace sessionContext placeholders (e.g. :condominiumId)
      for (const [key, value] of Object.entries(sessionContext)) {
        href = href.replace(`:${key}`, value).replace(`{${key}}`, value);
      }

      // Replace item-specific placeholders via paramMappings
      for (const mapping of config.paramMappings) {
        const value = this.getNestedField(item, mapping.responseField);
        if (value !== undefined) {
          href = href.replace(`:${mapping.urlParam}`, String(value))
                     .replace(`{${mapping.urlParam}}`, String(value));
        }
      }

      links[config.rel] = href;
    }

    return links;
  }

  private getNestedField(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }
}
