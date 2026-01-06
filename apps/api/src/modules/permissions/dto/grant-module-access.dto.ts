import { z } from 'zod';

/**
 * Zod schema for granting module access to a user
 */
export const grantModuleAccessSchema = z.object({
  moduleId: z
    .string({ message: 'El ID del módulo es requerido' })
    .uuid('El ID del módulo debe ser un UUID válido'),

  expiresAt: z
    .string()
    .datetime('La fecha de expiración debe estar en formato ISO 8601')
    .optional(),
});

/**
 * DTO for granting module access
 */
export type GrantModuleAccessDto = z.infer<typeof grantModuleAccessSchema>;

/**
 * Validate grant module access data
 */
export function validateGrantModuleAccessDto(
  data: unknown,
): GrantModuleAccessDto {
  return grantModuleAccessSchema.parse(data);
}
