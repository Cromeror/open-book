/**
 * Common API response types
 */

/**
 * Standard API error response
 */
export interface ApiError {
  /** HTTP status code */
  statusCode: number;
  /** Error message */
  message: string | string[];
  /** Error type/code */
  error?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Timestamp of the error */
  timestamp?: string;
  /** Request path that caused the error */
  path?: string;
}

/**
 * Standard success response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Optional message */
  message?: string;
  /** Timestamp of the response */
  timestamp?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Total count of items */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
}

/**
 * Query parameters for pagination
 */
export interface PaginationQuery {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query parameters for filtering
 */
export interface FilterQuery {
  /** Search term */
  search?: string;
  /** Filter by field values */
  filters?: Record<string, string | number | boolean>;
}

/**
 * Combined query parameters
 */
export interface QueryParams extends PaginationQuery, FilterQuery {}
