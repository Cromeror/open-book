import { z } from 'zod';

/**
 * Schema for login validation
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'El email es requerido' })
    .email('Formato de email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string({ message: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida'),
});

/**
 * Login DTO type
 */
export type LoginDto = z.infer<typeof loginSchema>;

/**
 * Validates login data and returns typed DTO
 * @throws z.ZodError if validation fails
 */
export function validateLoginDto(data: unknown): LoginDto {
  return loginSchema.parse(data);
}
