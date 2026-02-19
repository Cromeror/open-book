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
 * Step 1: URL Base + Resource Details
 */
export const step1Schema = z.object({
  rawUrl: z
    .string()
    .min(1, 'La URL es requerida')
    .regex(/^\/api\//, 'La URL debe comenzar con /api/')
    .regex(/^\/api\/[a-zA-Z0-9\-_/.]+$/, 'La URL contiene caracteres inválidos'),
  code: z
    .string()
    .min(1, 'El código es requerido')
    .max(50, 'El código debe tener máximo 50 caracteres')
    .regex(/^[a-z][a-z0-9_-]*$/, 'Alfanumérico en minúsculas con guiones o guiones bajos'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre debe tener máximo 100 caracteres'),
  scope: z.enum(['global', 'condominium'], {
    error: 'El alcance debe ser global o condominium',
  }),
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
  0: ['rawUrl', 'code', 'name', 'scope'],
  1: ['methodConfigs'],
  2: ['segments'],
};
