/**
 * Resource types for HATEOAS configuration
 *
 * Key design principle: Unified capability model
 * - No distinction between "standard" and "custom" capabilities
 * - All capabilities follow the same structure
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
 * HTTP methods for capabilities
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Resource capability definition
 *
 * Represents an action available on the resource.
 * Can be CRUD operations (list, get, create, update, delete) or
 * custom operations (close, approve, export, etc.)
 *
 * @example CRUD capability
 * ```typescript
 * { name: 'list', method: 'GET', urlPattern: '' }
 * // Generates: GET /api/condominiums/{condominiumId}/goals
 * ```
 *
 * @example Custom capability
 * ```typescript
 * { name: 'close', method: 'POST', urlPattern: '/{id}/close' }
 * // Generates: POST /api/condominiums/{condominiumId}/goals/{id}/close
 * ```
 */
export interface ResourceCapability {
  /**
   * Capability name (e.g., 'list', 'create', 'close', 'export')
   * Used as the 'rel' in HATEOAS links
   */
  name: string;

  /**
   * HTTP method for this capability
   */
  method: HttpMethod;

  /**
   * URL pattern appended to baseUrl
   * - '' for collection operations (list, create)
   * - '/{id}' for item operations (get, update, delete)
   * - '/{id}/action' for item actions (close, approve)
   *
   * @example
   * baseUrl: '/api/goals'
   * urlPattern: '/{id}/close'
   * → Final URL: '/api/goals/{id}/close'
   */
  urlPattern: string;

  /**
   * Optional permission required to execute this capability
   * If not provided, defaults to '{resourceCode}:{capabilityName}'
   *
   * @example
   * resourceCode: 'goals'
   * name: 'close'
   * permission: undefined
   * → Default permission: 'goals:close'
   */
  permission?: string;
}

// ============================================
// HATEOAS Link (Generated from Capability)
// ============================================

/**
 * HATEOAS link generated from a capability
 * This is what gets injected into API responses by the proxy
 */
export interface HateoasLink {
  /**
   * Relation type (from capability.name)
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
 * DTO for creating a resource
 */
export interface CreateResourceDto {
  code: string;
  name: string;
  scope: ResourceScope;
  baseUrl: string;
  capabilities: ResourceCapability[];
}

/**
 * DTO for updating a resource
 */
export interface UpdateResourceDto {
  name?: string;
  scope?: ResourceScope;
  baseUrl?: string;
  capabilities?: ResourceCapability[];
  isActive?: boolean;
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
