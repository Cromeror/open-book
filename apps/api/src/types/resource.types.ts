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
 * Resource scope
 * - global: Resource is not scoped to a condominium (e.g., /api/users)
 * - condominium: Resource is scoped to a condominium (e.g., /api/condominiums/{id}/goals)
 */
export type ResourceScope = 'global' | 'condominium';

/**
 * Supported HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Resource-HTTP method association
 *
 * Represents an action available on the resource.
 * Can be CRUD operations (list, get, create, update, delete) or
 * custom operations (close, approve, export, etc.)
 *
 * @example CRUD method
 * ```typescript
 * { name: 'list', method: 'GET', urlPattern: '' }
 * // Generates: GET /api/condominiums/{condominiumId}/goals
 * ```
 *
 * @example Custom method
 * ```typescript
 * { name: 'close', method: 'POST', urlPattern: '/{id}/close' }
 * // Generates: POST /api/condominiums/{condominiumId}/goals/{id}/close
 * ```
 */
export interface ResourceHttpMethod {
  /**
   * Method name (e.g., 'list', 'create', 'close', 'export')
   * Used as the 'rel' in HATEOAS links
   */
  name: string;

  /**
   * HTTP method for this association
   */
  method: HttpMethod;

  /**
   * URL pattern appended to templateUrl
   * - '' for collection operations (list, create)
   * - '/{id}' for item operations (get, update, delete)
   * - '/{id}/action' for item actions (close, approve)
   *
   * @example
   * templateUrl: '/api/goals'
   * urlPattern: '/{id}/close'
   * → Final URL: '/api/goals/{id}/close'
   */
  urlPattern: string;

  /**
   * Optional permission required to execute this method
   * If not provided, defaults to '{resourceCode}:{name}'
   *
   * @example
   * resourceCode: 'goals'
   * name: 'close'
   * permission: undefined
   * → Default permission: 'goals:close'
   */
  permission?: string;

  /** JSON string describing the expected request payload */
  payloadMetadata?: string;

  /** JSON string describing the successful response structure */
  responseMetadata?: string;
}

// ============================================
// HATEOAS Link (Generated from ResourceHttpMethod)
// ============================================

/**
 * HATEOAS link generated from a resource HTTP method
 * This is what gets injected into API responses by the proxy
 */
export interface HateoasLink {
  /**
   * Relation type (from resourceHttpMethod.name)
   */
  rel: string;

  /**
   * Fully interpolated URL
   * All placeholders ({condominiumId}, {id}) are replaced with actual values
   */
  href: string;

  /**
   * HTTP method
   */
  method: HttpMethod;

  /**
   * Optional human-readable title
   */
  title?: string;
}

/**
 * HATEOAS links collection added to API responses
 */
export interface HateoasLinks {
  _links: HateoasLink[];
}

// ============================================
// Request/Response DTOs
// ============================================

/**
 * DTO for creating a resource (resource only, no HTTP methods)
 */
export interface CreateResourceDto {
  code: string;
  name: string;
  scope: ResourceScope;
  templateUrl: string;
}

/**
 * DTO for updating a resource
 */
export interface UpdateResourceDto {
  name?: string;
  scope?: ResourceScope;
  templateUrl?: string;
  isActive?: boolean;
}

/**
 * DTO for assigning an HTTP method to a resource
 */
export interface AssignHttpMethodDto {
  method: HttpMethod;
  payloadMetadata?: string;
  responseMetadata?: string;
}

/**
 * Query options for listing resources
 */
export interface FindResourcesOptions {
  scope?: ResourceScope;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'code' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}
