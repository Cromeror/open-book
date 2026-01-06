import { z } from 'zod';

/**
 * Zod schema for granting module access to a pool
 */
export const grantPoolModuleSchema = z.object({
  moduleId: z
    .string({ message: 'El ID del módulo es requerido' })
    .uuid('El ID del módulo debe ser un UUID válido'),
});

/**
 * DTO for granting module access to a pool
 */
export type GrantPoolModuleDto = z.infer<typeof grantPoolModuleSchema>;

/**
 * Validate grant pool module data
 */
export function validateGrantPoolModuleDto(data: unknown): GrantPoolModuleDto {
  return grantPoolModuleSchema.parse(data);
}
