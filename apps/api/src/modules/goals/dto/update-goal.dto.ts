import { z } from 'zod';

/**
 * Raw input type for updating a goal (before validation)
 * Use this for typing request body parameters
 */
export interface UpdateGoalInput {
  name?: string;
  description?: string | null;
  targetAmount?: number | string;
  startDate?: string | Date;
  endDate?: string | Date | null;
}

/**
 * Schema for updating an existing fundraising goal
 *
 * All fields are optional since this is a partial update.
 * Same validations as create, but applied only to provided fields.
 *
 * Business rules enforced at service level:
 * - Cannot modify targetAmount if status is COMPLETED
 * - Cannot modify if goal is in terminal state (COMPLETED, CANCELLED)
 */
export const updateGoalSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(200, 'Name cannot exceed 200 characters')
      .optional(),

    description: z
      .string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional()
      .nullable(),

    targetAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      .pipe(
        z
          .number()
          .positive('Target amount must be greater than 0')
          .max(9999999999999.99, 'Amount exceeds the allowed limit'),
      )
      .optional(),

    startDate: z.coerce
      .date({
        message: 'Invalid date format',
      })
      .optional(),

    endDate: z.coerce
      .date({
        message: 'Invalid date format',
      })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Both dates must be provided to validate relationship
      if (!data.startDate || !data.endDate) return true;
      return data.endDate >= data.startDate;
    },
    {
      message: 'End date must be equal to or after start date',
      path: ['endDate'],
    },
  );

export type UpdateGoalDto = z.infer<typeof updateGoalSchema>;

/**
 * Validate and parse update goal data
 * @throws ZodError if validation fails
 */
export function validateUpdateGoalDto(data: unknown): UpdateGoalDto {
  return updateGoalSchema.parse(data);
}
