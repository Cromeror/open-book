import 'server-only';

import {
  getServerPermissions,
  requireAuth,
  requireModule,
  requirePermission,
  requireSuperAdmin,
  type ServerPermissions,
} from './permissions.server';
import type { PermissionContext } from './types';

/**
 * Result type for protected actions
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Wrap a Server Action with authentication requirement
 *
 * @example
 * ```tsx
 * export const updateProfile = withAuth(async (permissions, formData: FormData) => {
 *   // User is authenticated
 *   const name = formData.get('name');
 *   // ... update profile
 *   return { updated: true };
 * });
 * ```
 */
export function withAuth<TArgs extends unknown[], TResult>(
  action: (permissions: ServerPermissions, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      const permissions = await requireAuth();
      const result = await action(permissions, ...args);
      return { success: true, data: result };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error de autenticación';
      return { success: false, error: message };
    }
  };
}

/**
 * Wrap a Server Action with module requirement
 *
 * @example
 * ```tsx
 * export const createObjetivo = withModule('objetivos', async (permissions, formData: FormData) => {
 *   // User has access to objetivos module
 *   const nombre = formData.get('nombre');
 *   // ... create objetivo
 *   return { id: '...' };
 * });
 * ```
 */
export function withModule<TArgs extends unknown[], TResult>(
  module: string,
  action: (permissions: ServerPermissions, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      const permissions = await requireModule(module);
      const result = await action(permissions, ...args);
      return { success: true, data: result };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No tienes acceso a este módulo';
      return { success: false, error: message };
    }
  };
}

/**
 * Wrap a Server Action with permission requirement
 *
 * @example
 * ```tsx
 * export const createObjetivo = withPermission('objetivos:create', async (permissions, formData: FormData) => {
 *   // User can create objetivos
 *   const nombre = formData.get('nombre');
 *   // ... create objetivo
 *   return { id: '...' };
 * });
 * ```
 */
export function withPermission<TArgs extends unknown[], TResult>(
  permission: string,
  action: (permissions: ServerPermissions, ...args: TArgs) => Promise<TResult>,
  context?: PermissionContext
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      const permissions = await requirePermission(permission, context);
      const result = await action(permissions, ...args);
      return { success: true, data: result };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No tienes permiso para esta acción';
      return { success: false, error: message };
    }
  };
}

/**
 * Wrap a Server Action with scoped permission requirement
 *
 * The scope ID is extracted from the first argument or a specified getter function.
 *
 * @example
 * ```tsx
 * export const updateObjetivo = withScopedPermission(
 *   'objetivos:update',
 *   (args) => args[0].copropiedadId, // Extract scopeId from first arg
 *   async (permissions, data: { copropiedadId: string; nombre: string }) => {
 *     // User can update objetivos in this copropiedad
 *     return { updated: true };
 *   }
 * );
 * ```
 */
export function withScopedPermission<TArgs extends unknown[], TResult>(
  permission: string,
  getScopeId: (args: TArgs) => string,
  action: (permissions: ServerPermissions, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      const permissions = await getServerPermissions();

      if (!permissions.isAuthenticated) {
        return { success: false, error: 'Autenticación requerida' };
      }

      // Check permission using the can() method
      if (!permissions.can(permission)) {
        return {
          success: false,
          error: `No tienes permiso para esta acción`,
        };
      }

      const result = await action(permissions, ...args);
      return { success: true, data: result };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al ejecutar la acción';
      return { success: false, error: message };
    }
  };
}

/**
 * Wrap a Server Action with SuperAdmin requirement
 *
 * @example
 * ```tsx
 * export const deleteUser = withSuperAdmin(async (permissions, userId: string) => {
 *   // User is SuperAdmin
 *   // ... delete user
 *   return { deleted: true };
 * });
 * ```
 */
export function withSuperAdmin<TArgs extends unknown[], TResult>(
  action: (permissions: ServerPermissions, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      const permissions = await requireSuperAdmin();
      const result = await action(permissions, ...args);
      return { success: true, data: result };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Se requiere acceso de SuperAdmin';
      return { success: false, error: message };
    }
  };
}
