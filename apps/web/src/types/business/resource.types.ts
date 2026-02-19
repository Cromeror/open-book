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
 * Resource-HTTP method association
 *
 * Mirrors the backend `resource_http_methods` junction table.
 * Each entry links a resource to an HTTP method with metadata
 * about the expected request payload and response structure.
 */
export interface ResourceHttpMethod {
  /**
   * Capability name (e.g., 'list', 'create', 'close', 'export')
   * Used as the 'rel' in HATEOAS links
   */
  name: string;

  /** HTTP method for this association */
  method: HttpMethod;

  /**
   * URL pattern appended to templateUrl
   * - '' for collection operations (list, create)
   * - '/{id}' for item operations (get, update, delete)
   * - '/{id}/action' for item actions (close, approve)
   */
  urlPattern: string;

  /**
   * Optional permission required to execute this method
   * If not provided, defaults to '{resourceCode}:{name}'
   */
  permission?: string;

  /** Metadata describing the expected request payload (JSON) */
  payloadMetadata?: string;

  /** Metadata describing the successful response structure (JSON) */
  responseMetadata?: string;

  /** Whether this resource-method association is active */
  isActive?: boolean;
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
  /** URL template for this resource */
  templateUrl: string;
  /** HTTP methods associated with this resource */
  httpMethods: ResourceHttpMethod[];
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
