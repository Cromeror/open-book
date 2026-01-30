import { z } from 'zod';

/**
 * Zod schema for resource capability validation
 */
export const capabilitySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .regex(/^[a-z][a-z0-9_]*$/, 'Name must be lowercase alphanumeric with underscores'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
    errorMap: () => ({ message: 'Method must be GET, POST, PUT, PATCH, or DELETE' }),
  }),
  urlPattern: z.string(), // Can be empty
  permission: z.string().optional(),
});

/**
 * Zod schema for resource form validation
 */
export const resourceFormSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(50, 'Code must be at most 50 characters')
    .regex(
      /^[a-z][a-z0-9_-]*$/,
      'Code must be lowercase alphanumeric with underscores or hyphens',
    ),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  scope: z.enum(['global', 'condominium'], {
    errorMap: () => ({ message: 'Scope must be global or condominium' }),
  }),
  baseUrl: z
    .string()
    .min(1, 'Base URL is required')
    .max(255, 'Base URL must be at most 255 characters')
    .regex(/^\/api\//, 'Base URL must start with /api/'),
  capabilities: z.array(capabilitySchema).min(1, 'At least one capability is required'),
});

export type ResourceFormData = z.infer<typeof resourceFormSchema>;
export type CapabilityFormData = z.infer<typeof capabilitySchema>;
