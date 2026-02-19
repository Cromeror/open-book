import { z } from 'zod';

/**
 * Zod schemas for PayloadMetadata and ResponseMetadata
 *
 * Mirrors the backend types in resource-metadata.types.ts.
 * Used to validate JSON entered in the resource creation wizard (Step 2).
 */

// ============================================
// Base schemas
// ============================================

const schemaTypeSchema = z.enum([
  'string',
  'number',
  'integer',
  'boolean',
  'object',
  'array',
  'null',
]);

const schemaFormatSchema = z.enum([
  'date',
  'date-time',
  'email',
  'uri',
  'uuid',
  'binary',
  'password',
]);

const parameterLocationSchema = z.enum(['path', 'query', 'header', 'cookie']);

const httpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]);

// ============================================
// PropertySchema (recursive)
// ============================================

type PropertySchemaType = z.infer<typeof basePropertySchema> & {
  items?: PropertySchemaType;
  properties?: Record<string, PropertySchemaType>;
};

const basePropertySchema = z.object({
  type: schemaTypeSchema,
  format: schemaFormatSchema.optional(),
  description: z.string().optional(),

  // Validation constraints
  required: z.boolean().optional(),
  nullable: z.boolean().optional(),
  default: z.unknown().optional(),

  // String constraints
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  pattern: z.string().optional(),
  enum: z.array(z.string()).optional(),

  // Number constraints
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  multipleOf: z.number().positive().optional(),

  // Array constraints
  minItems: z.number().int().nonnegative().optional(),
  maxItems: z.number().int().positive().optional(),

  // Object constraints
  additionalProperties: z.boolean().optional(),

  // Documentation
  example: z.unknown().optional(),
});

export const propertySchema: z.ZodType<PropertySchemaType> = basePropertySchema.extend({
  items: z.lazy(() => propertySchema).optional(),
  properties: z.lazy(() => z.record(z.string(), propertySchema)).optional(),
});

// ============================================
// ParameterDefinition
// ============================================

export const parameterDefinitionSchema = z.object({
  name: z.string().min(1, 'El nombre del parámetro es requerido'),
  in: parameterLocationSchema,
  description: z.string().optional(),
  required: z.boolean(),
  schema: propertySchema,
  example: z.unknown().optional(),
});

// ============================================
// RequestBodyDefinition
// ============================================

export const requestBodyDefinitionSchema = z.object({
  description: z.string().optional(),
  required: z.boolean(),
  contentType: z.string().min(1, 'El content type es requerido'),
  schema: propertySchema,
  examples: z
    .record(
      z.string(),
      z.object({ summary: z.string().optional(), value: z.unknown() }),
    )
    .optional(),
});

// ============================================
// PayloadMetadata
// ============================================

export const payloadMetadataSchema = z.object({
  method: httpMethodSchema,
  parameters: z.array(parameterDefinitionSchema).optional(),
  requestBody: requestBodyDefinitionSchema.optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  deprecated: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================
// SuccessResponseDefinition
// ============================================

export const successResponseDefinitionSchema = z.object({
  statusCode: z.number().int().min(200).max(299),
  description: z.string().optional(),
  contentType: z.string().min(1, 'El content type es requerido'),
  schema: propertySchema.optional(),
  headers: z
    .record(
      z.string(),
      z.object({
        description: z.string().optional(),
        schema: propertySchema,
      }),
    )
    .optional(),
  examples: z
    .record(
      z.string(),
      z.object({ summary: z.string().optional(), value: z.unknown() }),
    )
    .optional(),
});

// ============================================
// ResponseMetadata
// ============================================

export const responseMetadataSchema = z.object({
  method: httpMethodSchema,
  success: successResponseDefinitionSchema.optional(),
  includeHateoasLinks: z.boolean().optional(),
  description: z.string().optional(),
  deprecated: z.boolean().optional(),
});

// ============================================
// Validation helpers
// ============================================

export type PayloadMetadataValidation = z.infer<typeof payloadMetadataSchema>;
export type ResponseMetadataValidation = z.infer<typeof responseMetadataSchema>;

/**
 * Validate a JSON string as PayloadMetadata.
 * Returns null if valid, or an error message string.
 */
export function validatePayloadMetadata(json: string): string | null {
  if (!json.trim()) return null; // empty is allowed (optional)

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return 'JSON inválido';
  }

  const result = payloadMetadataSchema.safeParse(parsed);
  if (result.success) return null;

  return result.error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    })
    .join('; ');
}

/**
 * Validate a JSON string as ResponseMetadata.
 * Returns null if valid, or an error message string.
 */
export function validateResponseMetadata(json: string): string | null {
  if (!json.trim()) return null; // empty is allowed (optional)

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return 'JSON inválido';
  }

  const result = responseMetadataSchema.safeParse(parsed);
  if (result.success) return null;

  return result.error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    })
    .join('; ');
}
