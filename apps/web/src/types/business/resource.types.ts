/**
 * Resource Types
 *
 * Types for HATEOAS resource configuration.
 * Pure business types - no ORM decorators, no transport concerns.
 */

/**
 * HTTP methods supported for capabilities
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Resource scope
 * - global: Resource is not scoped to a condominium (e.g., /api/users)
 * - condominium: Resource is scoped to a condominium (e.g., /api/condominiums/{id}/goals)
 */
export type ResourceScope = 'global' | 'condominium';

/**
 * Resource capability definition
 *
 * Represents an action available on the resource.
 * Can be CRUD operations (list, get, create, update, delete) or
 * custom operations (close, approve, export, etc.)
 */
export interface ResourceCapability {
  /**
   * Capability name (e.g., 'list', 'create', 'close', 'export')
   * Used as the 'rel' in HATEOAS links
   */
  name: string;

  /** HTTP method for this capability */
  method: HttpMethod;

  /**
   * URL pattern appended to baseUrl
   * - '' for collection operations (list, create)
   * - '/{id}' for item operations (get, update, delete)
   * - '/{id}/action' for item actions (close, approve)
   */
  urlPattern: string;

  /**
   * Optional permission required to execute this capability
   * If not provided, defaults to '{resourceCode}:{capabilityName}'
   */
  permission?: string;
}

/**
 * HATEOAS Resource configuration
 */
export interface Resource {
  /** Unique identifier */
  id: string;
  /** Resource code (e.g., 'goals', 'users') */
  code: string;
  /** Display name */
  name: string;
  /** Resource scope */
  scope: ResourceScope;
  /** Base URL for this resource */
  baseUrl: string;
  /** Available capabilities */
  capabilities: ResourceCapability[];
  /** Whether resource is active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * HATEOAS link generated from a capability
 * This is what gets injected into API responses
 */
export interface HateoasLink {
  /** Relation type (from capability.name) */
  rel: string;
  /** Fully interpolated URL */
  href: string;
  /** HTTP method */
  method: HttpMethod;
  /** Optional human-readable title */
  title?: string;
}
