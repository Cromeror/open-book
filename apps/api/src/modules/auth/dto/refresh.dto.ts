import { z } from 'zod';

/**
 * Schema for refresh token validation
 */
export const refreshSchema = z.object({
  refreshToken: z
    .string({ message: 'El refresh token es requerido' })
    .min(1, 'El refresh token es requerido'),
});

/**
 * Refresh DTO type
 */
export type RefreshDto = z.infer<typeof refreshSchema>;

/**
 * Validates refresh data and returns typed DTO
 * @throws z.ZodError if validation fails
 */
export function validateRefreshDto(data: unknown): RefreshDto {
  return refreshSchema.parse(data);
}
