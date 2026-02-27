/**
 * Permission Types
 *
 * Core permission system types.
 * Pure business types - no ORM decorators, no transport concerns.
 */

/**
 * A permission granted to a user
 */
export interface Permission {
  /** Unique identifier */
  id: string;
  /** Permission code (e.g., 'create', 'read', 'update', 'delete') */
  code: string;
  /** Permission display name */
  name: string;
  /** Description */
  description?: string;
}

/**
 * Module in the permission system
 */
export interface PermissionModule {
  /** Unique identifier */
  id: string;
  /** Module code (e.g., 'goals', 'users') */
  code: string;
  /** Module display name */
  name: string;
  /** Description */
  description?: string;
}
