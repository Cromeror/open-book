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
 * Schema for creating a capability preset
 */
export const createPresetSchema = z.object({
  id: z
    .string()
    .min(1, 'ID is required')
    .max(50, 'ID must be at most 50 characters')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'ID must be alphanumeric with underscores'),
  label: z
    .string()
    .min(1, 'Label is required')
    .max(100, 'Label must be at most 100 characters'),
  description: z.string().max(500).nullable().optional(),
  capabilities: z.array(capabilitySchema).min(0, 'Capabilities must be an array'),
  isSystem: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0),
});

export type CreatePresetDto = z.infer<typeof createPresetSchema>;

/**
 * Validate and parse create preset data
 * @throws ZodError if validation fails
 */
export function validateCreatePresetDto(data: unknown): CreatePresetDto {
  return createPresetSchema.parse(data);
}
