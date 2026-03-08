import { z } from 'zod';

/**
 * Zod schema for a HATEOAS link param mapping
 */
export const resourceLinkParamMappingSchema = z.object({
  responseField: z.string().min(1),
  urlParam: z.string().min(1),
});

/**
 * Zod schema for a configured outbound HATEOAS link
 */
export const resourceHttpMethodLinkSchema = z.object({
  id: z.string().uuid().optional(),
  rel: z.string().min(1, 'rel is required'),
  targetHttpMethodId: z.string().uuid('targetHttpMethodId must be a valid UUID'),
  paramMappings: z.array(resourceLinkParamMappingSchema),
});

/**
 * Zod schema for resource-HTTP method association validation
 */
export const resourceHttpMethodSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
    error: 'Method must be GET, POST, PUT, PATCH, or DELETE',
  }),
  urlPattern: z.string(),
  permission: z.string().optional(),
  payloadMetadata: z.string().optional(),
  responseMetadata: z.string().optional(),
  isActive: z.boolean().optional(),
  outboundLinks: z.array(resourceHttpMethodLinkSchema).optional(),
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
  description: z.string().max(500, 'Description must be at most 500 characters').optional().nullable(),
  templateUrl: z
    .string()
    .min(1, 'Template URL is required')
    .max(255, 'Template URL must be at most 255 characters')
    .regex(/^\//, 'Template URL must start with /'),
  integrationId: z.string().uuid().optional().nullable(),
  httpMethods: z.array(resourceHttpMethodSchema).min(1, 'At least one HTTP method is required'),
});

export type ResourceFormData = z.infer<typeof resourceFormSchema>;
export type ResourceHttpMethodFormData = z.infer<typeof resourceHttpMethodSchema>;
export type ResourceHttpMethodLinkFormData = z.infer<typeof resourceHttpMethodLinkSchema>;
