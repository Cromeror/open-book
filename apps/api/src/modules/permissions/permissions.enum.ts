/**
 * Permission action types
 * Defines the possible actions that can be performed on a module
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  MANAGE = 'manage',
}

/**
 * Permission scope types
 * Defines the scope/context of a permission
 *
 * - OWN: User can only access their own resources
 * - COPROPIEDAD: User can access resources within their assigned copropiedad
 * - ALL: User can access all resources (SuperAdmin only)
 */
export enum Scope {
  OWN = 'own',
  COPROPIEDAD = 'copropiedad',
  ALL = 'all',
}

/**
 * Permission string format
 * Format: "module:action" or "module:action:scope"
 *
 * Examples:
 * - "objetivos:create" - Create objectives
 * - "aportes:read:own" - Read own contributions
 * - "reportes:export:copropiedad" - Export reports for assigned copropiedad
 */
export type Permission = `${string}:${Action}` | `${string}:${Action}:${Scope}`;

/**
 * Permission context for checking access
 */
export interface PermissionContext {
  /** ID of the copropiedad being accessed */
  copropiedadId?: string;
  /** ID of the resource owner (for OWN scope verification) */
  resourceOwnerId?: string;
  /** ID of the apartment being accessed */
  apartamentoId?: string;
}
