import { z } from 'zod';

/**
 * Zod schema for granting a granular permission to a pool
 */
export const grantPoolPermissionSchema = z.object({
  modulePermissionId: z
    .string({ message: 'El ID del permiso de módulo es requerido' })
    .uuid('El ID del permiso debe ser un UUID válido'),
});

/**
 * DTO for granting a granular permission to a pool
 */
export type GrantPoolPermissionDto = z.infer<typeof grantPoolPermissionSchema>;

/**
 * Validate grant pool permission data
 */
export function validateGrantPoolPermissionDto(
  data: unknown,
): GrantPoolPermissionDto {
  return grantPoolPermissionSchema.parse(data);
}
