import { z } from 'zod';

import { Scope } from '../../../types/permissions.enum';

/**
 * Zod schema for granting a granular permission to a user
 */
export const grantPermissionSchema = z
  .object({
    modulePermissionId: z
      .string({ message: 'El ID del permiso de módulo es requerido' })
      .uuid('El ID del permiso debe ser un UUID válido'),

    scope: z.nativeEnum(Scope, {
      message: 'El scope debe ser uno de: own, copropiedad, all',
    }),

    scopeId: z
      .string()
      .uuid('El ID del scope debe ser un UUID válido')
      .optional()
      .nullable(),

    expiresAt: z
      .string()
      .datetime('La fecha de expiración debe estar en formato ISO 8601')
      .optional(),
  })
  .refine(
    (data) => {
      // scopeId is required when scope is COPROPIEDAD
      if (data.scope === Scope.COPROPIEDAD && !data.scopeId) {
        return false;
      }
      return true;
    },
    {
      message:
        'El ID de copropiedad (scopeId) es requerido cuando el scope es "copropiedad"',
      path: ['scopeId'],
    },
  );

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
