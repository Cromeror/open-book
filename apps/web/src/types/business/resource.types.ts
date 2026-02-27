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
 * Parameter mapping for HATEOAS link resolution
 * Maps a field from the response body to a URL parameter placeholder
 */
export interface ResourceLinkParamMapping {
  /** Field path in the response body (e.g., 'id', 'goal.id') */
  responseField: string;
  /** URL parameter name in the target template (e.g., 'goalId', 'id') */
  urlParam: string;
}

/**
 * Outbound HATEOAS link configuration for a resource HTTP method
 *
 * Configures which links are generated when this method's response is returned.
 * Links point to other resource HTTP methods.
 */
export interface ResourceHttpMethodLink {
  /** UUID of the link record (undefined if not yet saved) */
  id?: string;
  /** Relation name included in the `_links` object (e.g., 'self', 'edit', 'delete') */
  rel: string;
  /** UUID of the target `resource_http_methods` row */
  targetHttpMethodId: string;
  /** Mappings from response fields to URL params of the target resource */
  paramMappings: ResourceLinkParamMapping[];
}

/**
 * Resource-HTTP method association
 *
 * Mirrors the backend `resource_http_methods` junction table.
 * Each entry links a resource to an HTTP method with metadata
 * about the expected request payload and response structure.
 */
export interface ResourceHttpMethod {
  /**
   * UUID of the `resource_http_methods` row.
   * Present when loaded from the backend; undefined for new methods not yet saved.
   */
  id?: string;

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

  /** Outbound HATEOAS links configured for this method */
  outboundLinks?: ResourceHttpMethodLink[];
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
  /** Optional description for documentation */
  description?: string | null;
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
