/**
 * Resource Metadata Types
 *
 * Mirrors the API types from apps/api/src/types/resource-metadata.types.ts
 * These define the structure of payloadMetadata and responseMetadata
 * stored in resource_http_methods (jsonb columns).
 */

export type ParameterLocation = 'path' | 'query' | 'header' | 'cookie';

export type SchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

export type SchemaFormat =
  | 'date'
  | 'date-time'
  | 'email'
  | 'uri'
  | 'uuid'
  | 'binary'
  | 'password';

export interface PropertySchema {
  type: SchemaType;
  format?: SchemaFormat;
  description?: string;
  required?: boolean;
  nullable?: boolean;
  default?: unknown;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  items?: PropertySchema;
  minItems?: number;
  maxItems?: number;
  properties?: Record<string, PropertySchema>;
  additionalProperties?: boolean;
  example?: unknown;
}

export interface ParameterDefinition {
  name: string;
  in: ParameterLocation;
  description?: string;
  required: boolean;
  schema: PropertySchema;
  example?: unknown;
}

export interface RequestBodyDefinition {
  description?: string;
  required: boolean;
  contentType: string;
  schema: PropertySchema;
  examples?: Record<string, { summary?: string; value: unknown }>;
}

export interface PayloadMetadata {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  parameters?: ParameterDefinition[];
  requestBody?: RequestBodyDefinition;
  description?: string;
  summary?: string;
  deprecated?: boolean;
  tags?: string[];
}

export interface SuccessResponseDefinition {
  statusCode: number;
  description?: string;
  contentType: string;
  schema?: PropertySchema;
  headers?: Record<string, { description?: string; schema: PropertySchema }>;
  examples?: Record<string, { summary?: string; value: unknown }>;
}

export interface ResponseMetadata {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  success: SuccessResponseDefinition;
  includeHateoasLinks?: boolean;
  description?: string;
  deprecated?: boolean;
}
