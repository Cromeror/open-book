import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { ResourceHttpMethod } from '../../entities/resource-http-method.entity';
import { ResourceHttpMethodLink, ParamMapping } from '../../entities/resource-http-method-link.entity';
import { ModuleResource } from '../../entities/module-resource.entity';
import { resolveTemplateUrl, SESSION_PLACEHOLDER_RE } from '../../utils';

const CACHE_TTL_MS = 60_000; // 1 minute

export interface ResolvedLink {
  rel: string;
  href: string;
  method: string;
  resourceId: string;
}

export interface LinkConfig {
  rel: string;
  targetResourceId: string;
  targetTemplateUrl: string;
  targetHttpMethod: string;
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
    @InjectRepository(ModuleResource)
    private readonly moduleResourceRepo: Repository<ModuleResource>,
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
      .leftJoinAndSelect('targetRhm.httpMethod', 'targetHm')
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
        targetResourceId: link.targetHttpMethod.resource.id,
        targetTemplateUrl: link.targetHttpMethod.resource.templateUrl,
        targetHttpMethod: link.targetHttpMethod.httpMethod.method,
        paramMappings: link.paramMappings,
      }));

    await this.cache.set(cacheKey, configs, CACHE_TTL_MS);
    return configs;
  }

  /**
   * Returns true if any config's templateUrl contains a {session:...} placeholder.
   * Used by the interceptor to decide whether to fetch session context.
   */
  needsSessionContext(configs: LinkConfig[]): boolean {
    return configs.some((c) => SESSION_PLACEHOLDER_RE.test(c.targetTemplateUrl));
  }

  /**
   * Resolves _links for a single response item.
   *
   * @param item            - The response item (e.g. a Goal object)
   * @param configs         - Link configs loaded from getLinkConfigs()
   * @param routeParams     - Route params already known (e.g. { condominiumId: '...' })
   * @param sessionContext  - Resolved session context for {session:fieldName} placeholders
   * @param allowedRels     - Set of allowed rel values, or null/undefined to include all
   */
  resolveLinks(
    item: Record<string, unknown>,
    configs: LinkConfig[],
    routeParams: Record<string, string>,
    sessionContext?: Record<string, string>,
    allowedRels?: Set<string> | null,
  ): Record<string, { href: string; method: string; resourceId: string }> {
    const links: Record<string, { href: string; method: string; resourceId: string }> = {};

    for (const config of configs) {
      if (allowedRels && !allowedRels.has(config.rel)) {
        continue;
      }

      const itemContext: Record<string, unknown> = {};
      for (const mapping of config.paramMappings) {
        const resolved = resolveTemplateUrl(`{${mapping.responseField}}`, item);
        if (!resolved.startsWith('{')) itemContext[mapping.urlParam] = resolved;
      }

      const withSession = resolveTemplateUrl(config.targetTemplateUrl, sessionContext ?? {}, SESSION_PLACEHOLDER_RE);
      const href = resolveTemplateUrl(withSession, { ...routeParams, ...itemContext });

      links[config.rel] = { href, method: config.targetHttpMethod, resourceId: config.targetResourceId };
    }

    return links;
  }

  /**
   * Returns the module code associated with a resource code.
   * Cached for 1 minute. Returns null if no module is associated.
   */
  async getModuleCodeForResource(resourceCode: string): Promise<string | null> {
    const cacheKey = `hateoas:res2mod:${resourceCode}`;
    const cached = await this.cache.get<string>(cacheKey);
    if (cached !== undefined) return cached === '__null__' ? null : cached;

    const row = await this.moduleResourceRepo
      .createQueryBuilder('mr')
      .innerJoin('mr.resource', 'r')
      .innerJoin('mr.module', 'm')
      .where('r.code = :resourceCode', { resourceCode })
      .andWhere('m.isActive = true')
      .select('m.code', 'moduleCode')
      .getRawOne();

    const moduleCode = row?.moduleCode ?? null;
    await this.cache.set(cacheKey, moduleCode ?? '__null__', CACHE_TTL_MS);
    return moduleCode;
  }

}
