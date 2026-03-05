import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

import { HateoasService, LinkConfig } from './hateoas.service';
import {
  HATEOAS_RESOURCE_KEY,
  HateoasResourceMeta,
} from './hateoas-resource.decorator';
import { SessionContextService } from '../session-context/session-context.service';
import { PermissionsService } from '../permissions/permissions.service';

/**
 * Intercepts responses from handlers decorated with @HateoasResource,
 * enriches each item with a `_links` map built from configured outbound links.
 *
 * Links are filtered based on the user's permissions: only links whose `rel`
 * is allowed by the user's module permissions (via the `rels` field) are included.
 *
 * Supports two response shapes:
 * - Array:               [item, item, ...]       → each item gets _links
 * - Paginated object:    { data: [...], ... }    → each item in data gets _links
 * - Single object:       { id, ... }             → the object gets _links
 *
 * Placeholder resolution order:
 * 1. {session:fieldName}  → resolved from SessionContextService (user's active condominium, etc.)
 * 2. {fieldName}          → resolved from route params (e.g. :condominiumId in the URL)
 * 3. paramMappings        → resolved from the response item's own fields
 */
@Injectable()
export class HateoasInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly hateoasService: HateoasService,
    private readonly sessionContextService: SessionContextService,
    private readonly permissionsService: PermissionsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<HateoasResourceMeta>(
      HATEOAS_RESOURCE_KEY,
      context.getHandler(),
    );

    // No decorator → pass through untouched
    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest<Request>();

    // Build routeParams from route params (e.g. condominiumId)
    const routeParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(request.params ?? {})) {
      if (typeof value === 'string') {
        routeParams[key] = value;
      }
    }

    return next.handle().pipe(
      map(async (response) => {
        const configs = await this.hateoasService.getLinkConfigs(
          meta.resourceCode,
          meta.httpMethod,
        );

        if (!configs.length) return response;

        const userId = (request.user as { id?: string } | undefined)?.id;

        // Resolve session context only if any link template requires it
        let resolvedSession: Record<string, string> | undefined;
        if (this.hateoasService.needsSessionContext(configs) && userId) {
          const ctx = await this.sessionContextService.getContext(userId);
          resolvedSession = ctx as unknown as Record<string, string>;
        }

        // Resolve allowed rels based on user permissions
        let allowedRels: Set<string> | null = null;
        if (userId) {
          const moduleCode = await this.hateoasService.getModuleCodeForResource(
            meta.resourceCode,
          );
          if (moduleCode) {
            allowedRels = await this.permissionsService.getUserAllowedRels(
              userId,
              moduleCode,
            );
          }
        }

        return this.enrich(response, configs, routeParams, resolvedSession, allowedRels);
      }),
      // Unwrap the Promise that map() produces
      map((promise) => promise),
    );
  }

  private enrich(
    response: unknown,
    configs: LinkConfig[],
    routeParams: Record<string, string>,
    resolvedSession?: Record<string, string>,
    allowedRels?: Set<string> | null,
  ): unknown {
    // Array response
    if (Array.isArray(response)) {
      return response.map((item) =>
        this.enrichItem(item, configs, routeParams, resolvedSession, allowedRels),
      );
    }

    // Paginated response: { data: [...], pagination: {...} }
    if (
      response &&
      typeof response === 'object' &&
      'data' in (response as object) &&
      Array.isArray((response as { data: unknown }).data)
    ) {
      const paginated = response as { data: unknown[]; [key: string]: unknown };
      return {
        ...paginated,
        data: paginated.data.map((item) =>
          this.enrichItem(item, configs, routeParams, resolvedSession, allowedRels),
        ),
      };
    }

    // Single object response
    if (response && typeof response === 'object') {
      return this.enrichItem(
        response as Record<string, unknown>,
        configs,
        routeParams,
        resolvedSession,
        allowedRels,
      );
    }

    return response;
  }

  private enrichItem(
    item: unknown,
    configs: LinkConfig[],
    routeParams: Record<string, string>,
    resolvedSession?: Record<string, string>,
    allowedRels?: Set<string> | null,
  ): unknown {
    if (!item || typeof item !== 'object') return item;

    const links = this.hateoasService.resolveLinks(
      item as Record<string, unknown>,
      configs,
      routeParams,
      resolvedSession,
      allowedRels,
    );

    return { ...(item as object), _links: links };
  }
}
