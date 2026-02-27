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

import { HateoasService } from './hateoas.service';
import {
  HATEOAS_RESOURCE_KEY,
  HateoasResourceMeta,
} from './hateoas-resource.decorator';

/**
 * Intercepts responses from handlers decorated with @HateoasResource,
 * enriches each item with a `_links` map built from configured outbound links.
 *
 * Supports two response shapes:
 * - Array:               [item, item, ...]       → each item gets _links
 * - Paginated object:    { data: [...], ... }    → each item in data gets _links
 * - Single object:       { id, ... }             → the object gets _links
 */
@Injectable()
export class HateoasInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly hateoasService: HateoasService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<HateoasResourceMeta>(
      HATEOAS_RESOURCE_KEY,
      context.getHandler(),
    );

    // No decorator → pass through untouched
    if (!meta) return next.handle();

    const request = context.switchToHttp().getRequest<Request>();

    // Build sessionContext from route params (e.g. condominiumId)
    const sessionContext: Record<string, string> = {};
    for (const [key, value] of Object.entries(request.params ?? {})) {
      if (typeof value === 'string') {
        sessionContext[key] = value;
      }
    }

    return next.handle().pipe(
      map(async (response) => {
        const configs = await this.hateoasService.getLinkConfigs(
          meta.resourceCode,
          meta.httpMethod,
        );

        if (!configs.length) return response;

        return this.enrich(response, configs, sessionContext);
      }),
      // Unwrap the Promise that map() produces
      map((promise) => promise),
    );
  }

  private enrich(
    response: unknown,
    configs: Parameters<HateoasService['resolveLinks']>[1],
    sessionContext: Record<string, string>,
  ): unknown {
    // Array response
    if (Array.isArray(response)) {
      return response.map((item) => this.enrichItem(item, configs, sessionContext));
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
          this.enrichItem(item, configs, sessionContext),
        ),
      };
    }

    // Single object response
    if (response && typeof response === 'object') {
      return this.enrichItem(
        response as Record<string, unknown>,
        configs,
        sessionContext,
      );
    }

    return response;
  }

  private enrichItem(
    item: unknown,
    configs: Parameters<HateoasService['resolveLinks']>[1],
    sessionContext: Record<string, string>,
  ): unknown {
    if (!item || typeof item !== 'object') return item;

    const links = this.hateoasService.resolveLinks(
      item as Record<string, unknown>,
      configs,
      sessionContext,
    );

    return { ...(item as object), _links: links };
  }
}
