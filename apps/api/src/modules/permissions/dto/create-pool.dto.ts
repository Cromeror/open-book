import { z } from 'zod';

/**
 * Zod schema for creating a user pool
 */
export const createPoolSchema = z.object({
  name: z
    .string({ message: 'El nombre es requerido' })
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
});

/**
 * DTO for creating a user pool
 */
export type CreatePoolDto = z.infer<typeof createPoolSchema>;

/**
 * Validate create pool data
 */
export function validateCreatePoolDto(data: unknown): CreatePoolDto {
  return createPoolSchema.parse(data);
}
