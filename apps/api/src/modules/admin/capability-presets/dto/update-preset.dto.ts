import { z } from 'zod';

/**
 * Schema for capability validation within presets
 */
const capabilitySchema = z.object({
  name: z.string().min(1).regex(/^[a-z][a-z0-9_]*$/),
  method: z.enum(['GET', 'POST', 'PATCH', 'DELETE', 'PUT']),
  urlPattern: z.string(),
  permission: z.string().optional(),
});

/**
 * Schema for updating a capability preset
 * All fields are optional
 */
export const updatePresetSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(100, 'Label must be at most 100 characters')
    .optional(),
  description: z.string().max(500).nullable().optional(),
  capabilities: z.array(capabilitySchema).min(0, 'Capabilities must be an array').optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type UpdatePresetDto = z.infer<typeof updatePresetSchema>;

/**
 * Validate and parse update preset data
 * @throws ZodError if validation fails
 */
export function validateUpdatePresetDto(data: unknown): UpdatePresetDto {
  return updatePresetSchema.parse(data);
}
