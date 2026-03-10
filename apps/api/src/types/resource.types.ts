/**
 * Resource types for HATEOAS configuration
 *
 * Key design principle: Unified HTTP method model
 * - No distinction between "standard" and "custom" methods
 * - All resource-method associations follow the same structure
 * - Frontend presets are UI sugar, not reflected in data model
 */

// ============================================
// Core Types
// ============================================

/**
 * Supported HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const satisfies Record<string, HttpMethod>;

/**
 * Resource-HTTP method association
 *
 * Represents an action available on the resource.
 * Can be CRUD operations (list, get, create, update, delete) or
 * custom operations (close, approve, export, etc.)
 */
export interface ResourceHttpMethod {
  name: string;
  method: HttpMethod;
  urlPattern: string;
  permission?: string;
  payloadMetadata?: string;
  responseMetadata?: string;
}

// ============================================
// HATEOAS Link (Generated from ResourceHttpMethod)
// ============================================

export interface HateoasLink {
  rel: string;
  href: string;
  method: HttpMethod;
  title?: string;
}

export interface HateoasLinks {
  _links: HateoasLink[];
}

// ============================================
// Request/Response DTOs
// ============================================

export interface CreateResourceDto {
  code: string;
  name: string;
  description?: string | null;
  templateUrl: string;
  integrationId?: string | null;
  requiresExternalAuth?: boolean;
}

export interface UpdateResourceDto {
  name?: string;
  description?: string | null;
  templateUrl?: string;
  isActive?: boolean;
  integrationId?: string | null;
  requiresExternalAuth?: boolean;
}

export interface AssignHttpMethodDto {
  method: HttpMethod;
  payloadMetadata?: string;
  responseMetadata?: string;
}

export interface FindResourcesOptions {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'code' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}
