import { z } from 'zod';

/**
 * Raw input type for creating a goal (before validation)
 * Use this for typing request body parameters
 */
export interface CreateGoalInput {
  name: string;
  description?: string | null;
  targetAmount: number | string;
  startDate: string | Date;
  endDate?: string | Date | null;
}

/**
 * Schema for creating a new fundraising goal
 *
 * Validations:
 * - name: Required, 3-200 characters
 * - description: Optional, max 1000 characters
 * - targetAmount: Required, must be positive
 * - startDate: Required, valid date
 * - endDate: Optional, must be >= startDate if provided
 */
export const createGoalSchema = z
  .object({
    name: z
      .string({ message: 'Name is required' })
      .min(3, 'Name must be at least 3 characters')
      .max(200, 'Name cannot exceed 200 characters'),

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
          .number({ message: 'Target amount is required' })
          .positive('Target amount must be greater than 0')
          .max(9999999999999.99, 'Amount exceeds the allowed limit'),
      ),

    startDate: z.coerce.date({
      message: 'Start date is required or has invalid format',
    }),

    endDate: z.coerce
      .date({
        message: 'Invalid date format',
      })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return data.endDate >= data.startDate;
    },
    {
      message: 'End date must be equal to or after start date',
      path: ['endDate'],
    },
  );

export type CreateGoalDto = z.infer<typeof createGoalSchema>;

/**
 * Validate and parse create goal data
 * @throws ZodError if validation fails
 */
export function validateCreateGoalDto(data: unknown): CreateGoalDto {
  return createGoalSchema.parse(data);
}
