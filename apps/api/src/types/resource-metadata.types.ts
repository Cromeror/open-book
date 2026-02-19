/**
 * Resource Metadata Types
 *
 * Type definitions for payload and response metadata stored in the
 * resource_http_methods junction table.
 *
 * These types provide OpenAPI-inspired structure with Zod compatibility
 * for defining request/response schemas for each resource-method combination.
 */

// ============================================
// Base Types
// ============================================

/**
 * Parameter location for HTTP requests
 * Aligned with OpenAPI 3.x Parameter Object
 */
export type ParameterLocation = 'path' | 'query' | 'header' | 'cookie';

/**
 * Schema data types
 * Aligned with JSON Schema and Zod type system
 */
export type SchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

/**
 * Schema format hints for string types
 * Provides additional semantic information
 */
export type SchemaFormat =
  | 'date'
  | 'date-time'
  | 'email'
  | 'uri'
  | 'uuid'
  | 'binary'
  | 'password';

// ============================================
// Schema Definition (JSON Schema inspired)
// ============================================

/**
 * Property schema definition
 *
 * Follows JSON Schema structure for compatibility with validation libraries.
 * Supports nested schemas for objects and arrays.
 *
 * @example Simple string property
 * ```typescript
 * {
 *   type: 'string',
 *   minLength: 3,
 *   maxLength: 200,
 *   description: 'Goal name'
 * }
 * ```
 *
 * @example Object with nested properties
 * ```typescript
 * {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', minLength: 3 },
 *     amount: { type: 'number', minimum: 0 }
 *   }
 * }
 * ```
 */
export interface PropertySchema {
  /**
   * Data type of the property
   */
  type: SchemaType;

  /**
   * Format hint for the type (e.g., 'uuid' for strings, 'date-time' for dates)
   */
  format?: SchemaFormat;

  /**
   * Human-readable description of the property
   */
  description?: string;

  // ============================================
  // Validation Constraints
  // ============================================

  /**
   * Whether this property is required
   * Default: false
   */
  required?: boolean;

  /**
   * Whether this property can be null
   * Default: false
   */
  nullable?: boolean;

  /**
   * Default value if not provided
   */
  default?: unknown;

  // ============================================
  // String Constraints
  // ============================================

  /**
   * Minimum string length
   */
  minLength?: number;

  /**
   * Maximum string length
   */
  maxLength?: number;

  /**
   * Regex pattern the string must match
   */
  pattern?: string;

  /**
   * Allowed values (enum)
   */
  enum?: string[];

  // ============================================
  // Number Constraints
  // ============================================

  /**
   * Minimum numeric value (inclusive)
   */
  minimum?: number;

  /**
   * Maximum numeric value (inclusive)
   */
  maximum?: number;

  /**
   * Number must be a multiple of this value
   */
  multipleOf?: number;

  // ============================================
  // Array Constraints
  // ============================================

  /**
   * Schema for array items (when type is 'array')
   */
  items?: PropertySchema;

  /**
   * Minimum number of items in array
   */
  minItems?: number;

  /**
   * Maximum number of items in array
   */
  maxItems?: number;

  // ============================================
  // Object Constraints
  // ============================================

  /**
   * Properties of the object (when type is 'object')
   * Key is property name, value is its schema
   */
  properties?: Record<string, PropertySchema>;

  /**
   * Whether additional properties are allowed
   * Default: true
   */
  additionalProperties?: boolean;

  // ============================================
  // Documentation
  // ============================================

  /**
   * Example value for documentation
   */
  example?: unknown;
}

/**
 * Parameter definition for path, query, header, or cookie parameters
 *
 * Inspired by OpenAPI 3.x Parameter Object
 *
 * @example Path parameter
 * ```typescript
 * {
 *   name: 'condominiumId',
 *   in: 'path',
 *   required: true,
 *   schema: { type: 'string', format: 'uuid' }
 * }
 * ```
 *
 * @example Query parameter with default
 * ```typescript
 * {
 *   name: 'page',
 *   in: 'query',
 *   required: false,
 *   schema: { type: 'integer', minimum: 1, default: 1 }
 * }
 * ```
 */
export interface ParameterDefinition {
  /**
   * Parameter name
   */
  name: string;

  /**
   * Parameter location
   */
  in: ParameterLocation;

  /**
   * Human-readable description
   */
  description?: string;

  /**
   * Whether the parameter is required
   */
  required: boolean;

  /**
   * Parameter schema definition
   */
  schema: PropertySchema;

  /**
   * Example value for documentation
   */
  example?: unknown;
}

// ============================================
// Request Body Definition
// ============================================

/**
 * Request body definition for POST, PUT, PATCH methods
 *
 * @example JSON body
 * ```typescript
 * {
 *   required: true,
 *   contentType: 'application/json',
 *   schema: {
 *     type: 'object',
 *     properties: {
 *       name: { type: 'string', minLength: 3 },
 *       amount: { type: 'number', minimum: 0 }
 *     }
 *   }
 * }
 * ```
 */
export interface RequestBodyDefinition {
  /**
   * Description of the request body
   */
  description?: string;

  /**
   * Whether the request body is required
   */
  required: boolean;

  /**
   * MIME type of the request body
   * Common values: 'application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'
   */
  contentType: string;

  /**
   * Schema definition for the request body
   */
  schema: PropertySchema;

  /**
   * Example requests for documentation
   * Key is example name, value contains summary and example value
   */
  examples?: Record<string, { summary?: string; value: unknown }>;
}

// ============================================
// Request Payload Metadata
// ============================================

/**
 * Metadata describing the expected request payload for a resource-method combination
 *
 * Structure varies by HTTP method:
 * - GET: Only parameters (path, query)
 * - POST/PUT/PATCH: Parameters + requestBody
 * - DELETE: Only parameters (typically just path)
 * - HEAD/OPTIONS: Only parameters
 *
 * @example GET request with query parameters
 * ```typescript
 * {
 *   method: 'GET',
 *   summary: 'List goals',
 *   parameters: [
 *     { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } }
 *   ]
 * }
 * ```
 *
 * @example POST request with body
 * ```typescript
 * {
 *   method: 'POST',
 *   summary: 'Create goal',
 *   requestBody: {
 *     required: true,
 *     contentType: 'application/json',
 *     schema: {
 *       type: 'object',
 *       properties: {
 *         name: { type: 'string', minLength: 3 }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export interface PayloadMetadata {
  /**
   * HTTP method this metadata applies to
   * Stored for validation and clarity
   */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

  /**
   * Path, query, header, and cookie parameters
   * Common across all HTTP methods
   */
  parameters?: ParameterDefinition[];

  /**
   * Request body schema (for POST, PUT, PATCH)
   * Should be null or undefined for methods that don't support request bodies
   */
  requestBody?: RequestBodyDefinition;

  /**
   * Additional metadata for documentation
   */
  description?: string;

  /**
   * Short summary of the operation
   */
  summary?: string;

  /**
   * Whether this endpoint is deprecated
   */
  deprecated?: boolean;

  /**
   * Tags for categorization
   */
  tags?: string[];
}

// ============================================
// Response Metadata
// ============================================

/**
 * Success response definition
 *
 * Describes the structure of a successful (2xx) response
 */
export interface SuccessResponseDefinition {
  /**
   * HTTP status code (200, 201, 204, etc.)
   */
  statusCode: number;

  /**
   * Response description
   */
  description?: string;

  /**
   * Content type of response
   * Common values: 'application/json', 'text/plain'
   */
  contentType: string;

  /**
   * Response body schema
   * Null for 204 No Content
   */
  schema?: PropertySchema;

  /**
   * Response headers
   * Key is header name, value contains description and schema
   */
  headers?: Record<string, { description?: string; schema: PropertySchema }>;

  /**
   * Example responses for documentation
   * Key is example name, value contains summary and example value
   */
  examples?: Record<string, { summary?: string; value: unknown }>;
}

/**
 * Metadata describing the successful response structure
 *
 * Focuses on 2xx responses (successful operations).
 * Error responses (4xx, 5xx) are handled generically by the API.
 *
 * @example GET response
 * ```typescript
 * {
 *   method: 'GET',
 *   success: {
 *     statusCode: 200,
 *     contentType: 'application/json',
 *     schema: {
 *       type: 'object',
 *       properties: {
 *         id: { type: 'string', format: 'uuid' },
 *         name: { type: 'string' }
 *       }
 *     }
 *   },
 *   includeHateoasLinks: true
 * }
 * ```
 *
 * @example POST response with Location header
 * ```typescript
 * {
 *   method: 'POST',
 *   success: {
 *     statusCode: 201,
 *     contentType: 'application/json',
 *     schema: { type: 'object', properties: { id: { type: 'string' } } },
 *     headers: {
 *       Location: {
 *         description: 'URI of created resource',
 *         schema: { type: 'string', format: 'uri' }
 *       }
 *     }
 *   }
 * }
 * ```
 */
export interface ResponseMetadata {
  /**
   * HTTP method this metadata applies to
   */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

  /**
   * Success response definition (2xx status codes)
   */
  success: SuccessResponseDefinition;

  /**
   * Whether HATEOAS links will be injected by proxy
   * Default: true for this system
   */
  includeHateoasLinks?: boolean;

  /**
   * Additional metadata for documentation
   */
  description?: string;

  /**
   * Whether this endpoint is deprecated
   */
  deprecated?: boolean;
}
