import { z } from 'zod';

/**
 * Zod schema for granting a granular permission to a user
 */
export const grantPermissionSchema = z.object({
  modulePermissionId: z
    .string({ message: 'El ID del permiso de módulo es requerido' })
    .uuid('El ID del permiso debe ser un UUID válido'),

  expiresAt: z
    .string()
    .datetime('La fecha de expiración debe estar en formato ISO 8601')
    .optional(),
});

/**
 * DTO for granting a granular permission
 */
export type GrantPermissionDto = z.infer<typeof grantPermissionSchema>;

/**
 * Validate grant permission data
 */
export function validateGrantPermissionDto(data: unknown): GrantPermissionDto {
  return grantPermissionSchema.parse(data);
}
