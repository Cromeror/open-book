/**
 * Resource Metadata Zod Schemas
 *
 * Validation schemas for payload and response metadata.
 * These schemas provide runtime validation and type inference
 * for metadata stored in the resource_http_methods table.
 */

import { z } from 'zod';
import type {
  PropertySchema,
  ParameterDefinition,
  RequestBodyDefinition,
  PayloadMetadata,
  SuccessResponseDefinition,
  ResponseMetadata,
} from './resource-metadata.types';

// ============================================
// Base Type Schemas
// ============================================

/**
 * Schema for parameter location
 */
export const parameterLocationSchema = z.enum([
  'path',
  'query',
  'header',
  'cookie',
]);

/**
 * Schema for data types
 */
export const schemaTypeSchema = z.enum([
  'string',
  'number',
  'integer',
  'boolean',
  'object',
  'array',
  'null',
]);

/**
 * Schema for format hints
 */
export const schemaFormatSchema = z.enum([
  'date',
  'date-time',
  'email',
  'uri',
  'uuid',
  'binary',
  'password',
]);

/**
 * Schema for HTTP methods
 */
export const httpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]);

// ============================================
// Property Schema (Recursive)
// ============================================

/**
 * Zod schema for PropertySchema
 *
 * Uses z.lazy() for recursive validation (nested objects and arrays)
 */
export const propertySchemaSchema: z.ZodType<PropertySchema> = z.lazy(() =>
  z.object({
    type: schemaTypeSchema,
    format: schemaFormatSchema.optional(),
    description: z.string().optional(),

    // Validation constraints
    required: z.boolean().optional(),
    nullable: z.boolean().optional(),
    default: z.unknown().optional(),

    // String constraints
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().nonnegative().optional(),
    pattern: z.string().optional(),
    enum: z.array(z.string()).optional(),

    // Number constraints
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    multipleOf: z.number().positive().optional(),

    // Array constraints
    items: propertySchemaSchema.optional(),
    minItems: z.number().int().nonnegative().optional(),
    maxItems: z.number().int().nonnegative().optional(),

    // Object constraints
    properties: z.record(z.string(), propertySchemaSchema).optional(),
    additionalProperties: z.boolean().optional(),

    // Documentation
    example: z.unknown().optional(),
  }),
);

/**
 * Validation function for PropertySchema
 */
export function validatePropertySchema(data: unknown): PropertySchema {
  return propertySchemaSchema.parse(data);
}

// ============================================
// Parameter Definition Schema
// ============================================

/**
 * Zod schema for ParameterDefinition
 */
export const parameterDefinitionSchema: z.ZodType<ParameterDefinition> =
  z.object({
    name: z.string().min(1, 'Parameter name is required'),
    in: parameterLocationSchema,
    description: z.string().optional(),
    required: z.boolean(),
    schema: propertySchemaSchema,
    example: z.unknown().optional(),
  });

/**
 * Validation function for ParameterDefinition
 */
export function validateParameterDefinition(
  data: unknown,
): ParameterDefinition {
  return parameterDefinitionSchema.parse(data);
}

// ============================================
// Request Body Definition Schema
// ============================================

/**
 * Zod schema for RequestBodyDefinition
 */
export const requestBodyDefinitionSchema: z.ZodType<RequestBodyDefinition> =
  z.object({
    description: z.string().optional(),
    required: z.boolean(),
    contentType: z
      .string()
      .min(1, 'Content type is required')
      .refine(
        (val) =>
          val.includes('/') &&
          !val.startsWith('/') &&
          !val.endsWith('/'),
        {
          message:
            'Content type must be a valid MIME type (e.g., application/json)',
        },
      ),
    schema: propertySchemaSchema,
    examples: z
      .record(
        z.string(),
        z.object({
          summary: z.string().optional(),
          value: z.unknown(),
        }),
      )
      .optional(),
  });

/**
 * Validation function for RequestBodyDefinition
 */
export function validateRequestBodyDefinition(
  data: unknown,
): RequestBodyDefinition {
  return requestBodyDefinitionSchema.parse(data);
}

// ============================================
// Payload Metadata Schema
// ============================================

/**
 * Zod schema for PayloadMetadata
 */
export const payloadMetadataSchema: z.ZodType<PayloadMetadata> = z.object({
  method: httpMethodSchema,
  parameters: z.array(parameterDefinitionSchema).optional(),
  requestBody: requestBodyDefinitionSchema.optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  deprecated: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Validation function for PayloadMetadata
 */
export function validatePayloadMetadata(data: unknown): PayloadMetadata {
  return payloadMetadataSchema.parse(data);
}

// ============================================
// Response Metadata Schema
// ============================================

/**
 * Zod schema for SuccessResponseDefinition
 */
export const successResponseDefinitionSchema: z.ZodType<SuccessResponseDefinition> =
  z.object({
    statusCode: z
      .number()
      .int()
      .min(200, 'Status code must be >= 200')
      .max(299, 'Status code must be <= 299'),
    description: z.string().optional(),
    contentType: z
      .string()
      .min(1, 'Content type is required')
      .refine(
        (val) =>
          val.includes('/') &&
          !val.startsWith('/') &&
          !val.endsWith('/'),
        {
          message:
            'Content type must be a valid MIME type (e.g., application/json)',
        },
      ),
    schema: propertySchemaSchema.optional(),
    headers: z
      .record(
        z.string(),
        z.object({
          description: z.string().optional(),
          schema: propertySchemaSchema,
        }),
      )
      .optional(),
    examples: z
      .record(
        z.string(),
        z.object({
          summary: z.string().optional(),
          value: z.unknown(),
        }),
      )
      .optional(),
  });

/**
 * Zod schema for ResponseMetadata
 */
export const responseMetadataSchema: z.ZodType<ResponseMetadata> = z.object({
  method: httpMethodSchema,
  success: successResponseDefinitionSchema,
  includeHateoasLinks: z.boolean().optional(),
  description: z.string().optional(),
  deprecated: z.boolean().optional(),
});

/**
 * Validation function for ResponseMetadata
 */
export function validateResponseMetadata(data: unknown): ResponseMetadata {
  return responseMetadataSchema.parse(data);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Safe parse payload metadata (returns result with success flag)
 */
export function safeParsePayloadMetadata(data: unknown) {
  return payloadMetadataSchema.safeParse(data);
}

/**
 * Safe parse response metadata (returns result with success flag)
 */
export function safeParseResponseMetadata(data: unknown) {
  return responseMetadataSchema.safeParse(data);
}

/**
 * Extract validation error messages from Zod error
 */
export function extractValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}
