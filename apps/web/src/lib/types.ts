/**
 * Permission types shared between frontend components
 * These mirror the backend types from OB-002-C
 */

/**
 * Available modules in the system
 */
export type ModuleCode =
  | 'users'
  | 'copropiedades'
  | 'apartamentos'
  | 'objetivos'
  | 'actividades'
  | 'compromisos'
  | 'aportes'
  | 'pqr'
  | 'reportes'
  | 'auditoria'
  | 'notificaciones'
  | 'configuracion';

/**
 * Available actions for permissions
 */
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'manage';

/**
 * Scope of a permission
 * - own: Only user's own resources
 * - copropiedad: Resources within a specific copropiedad
 * - all: All resources (unrestricted)
 */
export type PermissionScope = 'own' | 'copropiedad' | 'all';

/**
 * A single permission entry
 */
export interface UserPermission {
  module: ModuleCode;
  action: PermissionAction;
  scope: PermissionScope;
  scopeId?: string;
}

/**
 * Response from GET /api/auth/me
 */
export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleCode[];
  permissions: UserPermission[];
}

/**
 * Context for permission checks (e.g., copropiedad scope)
 */
export interface PermissionContext {
  copropiedadId?: string;
  resourceOwnerId?: string;
}

/**
 * Permission string format: module:action
 */
export type PermissionString = `${ModuleCode}:${PermissionAction}`;
