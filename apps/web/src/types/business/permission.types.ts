/**
 * Permission Types
 *
 * Core permission system types.
 * Pure business types - no ORM decorators, no transport concerns.
 */

/**
 * Scope of a permission
 * - own: Only user's own resources
 * - copropiedad: Resources within a specific copropiedad
 * - all: All resources (unrestricted)
 */
export enum Scope {
  OWN = 'own',
  COPROPIEDAD = 'copropiedad',
  ALL = 'all',
}

/**
 * Context for permission validation
 * Used to check scope-based access at runtime
 */
export interface PermissionContext {
  /** ID of the copropiedad for scope validation */
  copropiedadId?: string;
  /** ID of the resource owner for 'own' scope validation */
  resourceOwnerId?: string;
}

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
