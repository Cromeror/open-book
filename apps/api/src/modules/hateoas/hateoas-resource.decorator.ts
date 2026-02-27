import { SetMetadata } from '@nestjs/common';

export const HATEOAS_RESOURCE_KEY = 'hateoas:resource';

export interface HateoasResourceMeta {
  resourceCode: string;
  httpMethod: string;
}

/**
 * Declares which resource+method this handler corresponds to,
 * enabling the HateoasInterceptor to enrich the response with _links.
 *
 * @param resourceCode - matches the `code` column in the `resources` table
 * @param httpMethod   - HTTP verb: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
 *
 * @example
 * @Get()
 * @HateoasResource('goals', 'GET')
 * findAll(...) { ... }
 */
export const HateoasResource = (resourceCode: string, httpMethod: string) =>
  SetMetadata<string, HateoasResourceMeta>(HATEOAS_RESOURCE_KEY, {
    resourceCode,
    httpMethod: httpMethod.toUpperCase(),
  });
