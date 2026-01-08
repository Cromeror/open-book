import { z } from 'zod';
import { GoalStatus } from '../../../entities/goal.entity';

/**
 * Raw input type for changing goal status (before validation)
 * Use this for typing request body parameters
 */
export interface ChangeStatusInput {
  newStatus: GoalStatus;
  justification?: string | null;
}

/**
 * Schema for changing the status of a fundraising goal
 *
 * Some transitions require justification:
 * - ACTIVE -> PAUSED: requires justification
 * - ACTIVE -> CANCELLED: requires justification
 * - PAUSED -> CANCELLED: requires justification
 *
 * Transitions that don't require justification:
 * - ACTIVE -> COMPLETED
 * - PAUSED -> ACTIVE
 */
export const changeStatusSchema = z
  .object({
    newStatus: z.nativeEnum(GoalStatus, {
      message: 'Invalid status',
    }),

    justification: z
      .string()
      .min(10, 'Justification must be at least 10 characters')
      .max(500, 'Justification cannot exceed 500 characters')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Justification required for PAUSED and CANCELLED
      const requiresJustification =
        data.newStatus === GoalStatus.PAUSED ||
        data.newStatus === GoalStatus.CANCELLED;

      if (requiresJustification && !data.justification) {
        return false;
      }
      return true;
    },
    {
      message: 'Justification is required for this status change',
      path: ['justification'],
    },
  );

export type ChangeStatusDto = z.infer<typeof changeStatusSchema>;

/**
 * Validate and parse change status data
 * @throws ZodError if validation fails
 */
export function validateChangeStatusDto(data: unknown): ChangeStatusDto {
  return changeStatusSchema.parse(data);
}
