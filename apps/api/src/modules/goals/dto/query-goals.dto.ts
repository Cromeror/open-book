import { z } from 'zod';
import { GoalStatus } from '../../../entities/goal.entity';

/**
 * Schema for querying/filtering goals
 *
 * Supports:
 * - Filtering by status
 * - Filtering by date range
 * - Searching by name (partial match)
 * - Sorting
 * - Pagination
 */
export const queryGoalsSchema = z.object({
  // Filters
  status: z.nativeEnum(GoalStatus).optional(),

  dateFrom: z.coerce
    .date({
      message: 'Invalid date format',
    })
    .optional(),

  dateTo: z.coerce
    .date({
      message: 'Invalid date format',
    })
    .optional(),

  name: z.string().max(200).optional(),

  // Sorting
  orderBy: z
    .enum(['name', 'targetAmount', 'startDate', 'endDate', 'createdAt'])
    .default('createdAt'),

  order: z.enum(['asc', 'desc']).default('desc'),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QueryGoalsDto = z.infer<typeof queryGoalsSchema>;

/**
 * Validate and parse query params
 * @throws ZodError if validation fails
 */
export function validateQueryGoalsDto(data: unknown): QueryGoalsDto {
  return queryGoalsSchema.parse(data);
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
