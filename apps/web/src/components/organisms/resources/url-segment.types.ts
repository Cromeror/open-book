/**
 * Types for the resource creation wizard
 */

/**
 * Represents a single URL segment after parsing
 */
export interface UrlSegment {
  /** The original text of the segment (e.g., 'abc-123', 'condominiums') */
  originalValue: string;
  /** Position index in the URL path */
  index: number;
  /** Whether this segment is marked as dynamic (variable) */
  isDynamic: boolean;
  /** If dynamic, the selected parameter key (e.g., 'condominiumId') */
  parameterKey: string | null;
}

/**
 * Available parameter keys for dynamic segments (mocked for now)
 */
export const PARAMETER_KEYS = [
  'condominiumId',
  'goalId',
  'propertyId',
  'userId',
  'apartmentId',
  'activityId',
  'commitmentId',
  'contributionId',
  'reportId',
  'pqrId',
] as const;

export type ParameterKey = (typeof PARAMETER_KEYS)[number];
