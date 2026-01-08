/**
 * Permission and scope type definitions
 *
 * Defines the permission system structure including scopes and contexts.
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
 * Context for permission checks
 * Used to validate scope-based access
 */
export interface PermissionContext {
  /** ID of the copropiedad for scope validation */
  copropiedadId?: string;
  /** ID of the resource owner for 'own' scope validation */
  resourceOwnerId?: string;
}

/**
 * DTO for granting a permission to a user
 */
export interface GrantPermissionDto {
  /** ID of the module permission to grant */
  modulePermissionId: string;
  /** Scope of the permission */
  scope: Scope;
  /** Optional scope ID (required for 'copropiedad' scope) */
  scopeId?: string;
  /** Optional expiration date */
  expiresAt?: Date;
}

/**
 * DTO for granting module access to a user
 */
export interface GrantModuleAccessDto {
  /** ID of the module to grant access to */
  moduleId: string;
  /** Optional expiration date */
  expiresAt?: Date;
}

/**
 * Permission with scope information
 */
export interface UserPermission {
  /** ID of the permission record */
  id: string;
  /** Permission code (e.g., 'create', 'read', 'update', 'delete') */
  code: string;
  /** Permission name */
  name: string;
  /** Module this permission belongs to */
  module: {
    id: string;
    code: string;
    name: string;
  };
  /** Scope of this permission */
  scope: Scope;
  /** Optional scope ID (for copropiedad scope) */
  scopeId?: string;
  /** Source of the permission */
  source: 'direct' | 'pool';
  /** Pool name if source is 'pool' */
  poolName?: string;
}

/**
 * Module access information
 */
export interface UserModuleAccess {
  /** Module information */
  module: {
    id: string;
    code: string;
    name: string;
    description?: string;
  };
  /** Source of the access */
  source: 'direct' | 'pool';
  /** Pool name if source is 'pool' */
  poolName?: string;
}
