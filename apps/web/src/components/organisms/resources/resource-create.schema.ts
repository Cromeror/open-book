import { z } from 'zod';
import { payloadMetadataSchema, responseMetadataSchema } from './metadata.schema';

/**
 * URL segment schema
 */
const urlSegmentSchema = z.object({
  originalValue: z.string(),
  index: z.number(),
  isDynamic: z.boolean(),
  parameterKey: z.string().nullable(),
});

/**
 * Validate a JSON string against a Zod schema.
 * Empty strings are allowed (field is optional).
 */
function jsonStringSchema(zodSchema: z.ZodTypeAny, label: string) {
  return z.string().optional().superRefine((val, ctx) => {
    if (!val || !val.trim()) return; // empty is valid

    let parsed: unknown;
    try {
      parsed = JSON.parse(val);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: `${label}: JSON inválido`,
      });
      return;
    }

    const result = zodSchema.safeParse(parsed);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.length > 0 ? ` (${issue.path.join('.')})` : '';
        ctx.addIssue({
          code: "custom",
          message: `${label}${path}: ${issue.message}`,
        });
      }
    }
  });
}

/**
 * Method configuration schema
 */
const methodConfigSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  enabled: z.boolean(),
  payloadMetadata: jsonStringSchema(payloadMetadataSchema, 'Payload'),
  responseMetadata: jsonStringSchema(responseMetadataSchema, 'Response'),
});

/**
 * Validates a URL path relative to a domain (no leading slash).
 * Segments can be:
 *   - Static: letters, digits, hyphens, underscores, dots  (e.g. api, v1, users)
 *   - Dynamic: {variable} or :variable
 * A single segment cannot mix static text with a variable placeholder.
 */
function validateRelativeUrl(val: string, ctx: z.RefinementCtx) {
  if (val.startsWith('/')) {
    ctx.addIssue({
      code: 'custom',
      message: 'La URL no debe comenzar con /. Solo ingresa el path relativo (ej: api/usuarios/{id})',
    });
    return;
  }

  if (val.trim() === '') return;

  const segments = val.split('/');

  for (const segment of segments) {
    if (segment === '') {
      ctx.addIssue({ code: 'custom', message: 'La URL no puede tener segmentos vacíos (doble /)' });
      return;
    }

    // Pure curly-brace variable: {varName}
    const isCurly = /^\{[a-zA-Z_][a-zA-Z0-9_]*\}$/.test(segment);
    // Pure colon variable: :varName
    const isColon = /^:[a-zA-Z_][a-zA-Z0-9_]*$/.test(segment);
    // Pure static segment
    const isStatic = /^[a-zA-Z0-9_\-\.]+$/.test(segment);

    if (!isCurly && !isColon && !isStatic) {
      ctx.addIssue({
        code: 'custom',
        message: `Segmento inválido: "${segment}". Use texto estático (letras, números, guiones), {variable} o :variable. No mezcle texto con variables en un mismo segmento.`,
      });
      return;
    }
  }
}

/**
 * Step 1: URL Base + Resource Details
 */
export const step1Schema = z.object({
  rawUrl: z
    .string()
    .min(1, 'La URL es requerida')
    .superRefine(validateRelativeUrl),
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(50, 'El código debe tener máximo 50 caracteres')
    .regex(/^[a-z][a-z0-9_-]*$/, 'Alfanumérico en minúsculas con guiones o guiones bajos'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre debe tener máximo 100 caracteres'),
  description: z.string().max(500, 'La descripción debe tener máximo 500 caracteres').optional().nullable(),
  integrationId: z.string().uuid().optional().nullable(),
  requiresExternalAuth: z.boolean().optional(),
});

/**
 * Step 2: HTTP Method Configuration
 */
export const step2Schema = z.object({
  methodConfigs: z
    .array(methodConfigSchema)
    .refine(
      (configs) => configs.some((c) => c.enabled),
      'Seleccione al menos un método HTTP',
    ),
});

/**
 * Step 3: Segment Definition
 */
export const step3Schema = z.object({
  segments: z
    .array(urlSegmentSchema)
    .min(1, 'La URL debe tener al menos un segmento')
    .refine(
      (segments) => segments.every((s) => !s.isDynamic || (s.parameterKey !== null && s.parameterKey !== '')),
      'Todos los segmentos dinámicos deben tener una clave de parámetro',
    ),
});

/**
 * Full wizard form schema (all steps combined)
 */
export const wizardFormSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
});

export type WizardFormData = z.infer<typeof wizardFormSchema>;
export type MethodConfig = z.infer<typeof methodConfigSchema>;

/**
 * Field names for each step (used with trigger() for per-step validation)
 */
export const STEP_FIELDS: Record<number, (keyof WizardFormData)[]> = {
  0: ['rawUrl', 'code', 'name', 'description', 'integrationId', 'requiresExternalAuth'],
  1: ['methodConfigs'],
  2: ['segments'],
};
