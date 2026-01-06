import { z } from 'zod';

/**
 * Zod schema for adding a member to a pool
 */
export const addPoolMemberSchema = z.object({
  userId: z
    .string({ message: 'El ID del usuario es requerido' })
    .uuid('El ID del usuario debe ser un UUID válido'),
});

/**
 * DTO for adding a member to a pool
 */
export type AddPoolMemberDto = z.infer<typeof addPoolMemberSchema>;

/**
 * Validate add pool member data
 */
export function validateAddPoolMemberDto(data: unknown): AddPoolMemberDto {
  return addPoolMemberSchema.parse(data);
}
