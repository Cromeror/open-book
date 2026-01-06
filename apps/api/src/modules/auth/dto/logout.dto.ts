import { z } from 'zod';

/**
 * Schema for logout validation
 */
export const logoutSchema = z.object({
  refreshToken: z
    .string({ message: 'El refresh token es requerido' })
    .min(1, 'El refresh token es requerido'),
});

/**
 * Logout DTO type
 */
export type LogoutDto = z.infer<typeof logoutSchema>;

/**
 * Validates logout data and returns typed DTO
 * @throws z.ZodError if validation fails
 */
export function validateLogoutDto(data: unknown): LogoutDto {
  return logoutSchema.parse(data);
}
