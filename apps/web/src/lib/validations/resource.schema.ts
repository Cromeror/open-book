import { z } from 'zod';

/**
 * Zod schema for resource-HTTP method association validation
 */
export const resourceHttpMethodSchema = z.object({
  name: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
    error: 'Method must be GET, POST, PUT, PATCH, or DELETE',
  }),
  urlPattern: z.string(),
  permission: z.string().optional(),
  payloadMetadata: z.string().optional(),
  responseMetadata: z.string().optional(),
  isActive: z.boolean().optional(),
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
    error: 'Scope must be global or condominium',
  }),
  templateUrl: z
    .string()
    .min(1, 'Template URL is required')
    .max(255, 'Template URL must be at most 255 characters')
    .regex(/^\/api\//, 'Template URL must start with /api/'),
  httpMethods: z.array(resourceHttpMethodSchema).min(1, 'At least one HTTP method is required'),
});

export type ResourceFormData = z.infer<typeof resourceFormSchema>;
export type ResourceHttpMethodFormData = z.infer<typeof resourceHttpMethodSchema>;
