import { z } from 'zod';

/**
 * Zod schema for user registration validation
 *
 * Validates:
 * - Email format
 * - Password strength (min 8 chars, 1 uppercase, 1 number)
 * - Required name fields (min 2 chars)
 * - Optional phone format
 * - Required consent boolean
 */
export const registerSchema = z.object({
  email: z
    .string({ message: 'El correo electrónico es requerido' })
    .email('El formato del correo electrónico no es válido')
    .max(255, 'El correo electrónico no puede exceder 255 caracteres'),

  password: z
    .string({ message: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),

  firstName: z
    .string({ message: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  lastName: z
    .string({ message: 'El apellido es requerido' })
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),

  phone: z
    .string()
    .regex(
      /^\+?[0-9]{10,15}$/,
      'El formato del teléfono no es válido (use formato internacional)'
    )
    .optional()
    .nullable(),

  publicAccountConsent: z.boolean({
    message:
      'Debe indicar su preferencia de visibilidad de cuenta (true o false)',
  }),
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type RegisterDto = z.infer<typeof registerSchema>;

/**
 * Validate registration data using Zod
 *
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 */
export function validateRegisterDto(data: unknown): RegisterDto {
  return registerSchema.parse(data);
}
