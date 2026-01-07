import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { publicEnv } from '@/config/env';

import type {
  AuthMeResponse,
  ModuleWithActions,
  PermissionContext,
} from './types';

/**
 * User info from authentication
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
}

/**
 * Server-side permissions object returned by getServerPermissions()
 *
 * Now uses ModuleWithActions from /api/auth/me
 * Action code = Permission code
 */
export interface ServerPermissions {
  userId: string | null;
  user: AuthUser | null;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  /** User's modules with their allowed actions */
  modules: ModuleWithActions[];

  /**
   * Check if user has access to a module
   */
  hasModule: (moduleCode: string) => boolean;

  /**
   * Check if user has a specific action in a module
   * Action code = Permission code
   * Format: "module:action" (e.g., "objetivos:create")
   */
  can: (permission: string, context?: PermissionContext) => boolean;

  /**
   * Check if user has a specific action in a module
   * Alternative API using separate parameters
   */
  hasAction: (moduleCode: string, actionCode: string) => boolean;

  /**
   * Get a module's metadata
   */
  getModule: (moduleCode: string) => ModuleWithActions | undefined;
}

/**
 * Create empty permissions object for unauthenticated users
 */
function createEmptyPermissions(): ServerPermissions {
  return {
    userId: null,
    user: null,
    isSuperAdmin: false,
    isAuthenticated: false,
    modules: [],
    hasModule: () => false,
    can: () => false,
    hasAction: () => false,
    getModule: () => undefined,
  };
}

/**
 * Create permissions object for SuperAdmin
 */
function createSuperAdminPermissions(
  user: AuthUser,
  modules: ModuleWithActions[]
): ServerPermissions {
  return {
    userId: user.id,
    user,
    isSuperAdmin: true,
    isAuthenticated: true,
    modules, // SuperAdmin gets all modules with all actions
    hasModule: () => true, // SuperAdmin has access to all modules
    can: () => true, // SuperAdmin can do everything
    hasAction: () => true, // SuperAdmin has all actions
    getModule: (code) => modules.find((m) => m.code === code),
  };
}

/**
 * Create permissions object for regular user
 */
function createUserPermissions(
  user: AuthUser,
  modules: ModuleWithActions[]
): ServerPermissions {
  return {
    userId: user.id,
    user,
    isSuperAdmin: false,
    isAuthenticated: true,
    modules,

    hasModule: (moduleCode: string) => {
      return modules.some((m) => m.code === moduleCode);
    },

    can: (permission: string, context?: PermissionContext) => {
      const [moduleCode, actionCode] = permission.split(':');

      if (!moduleCode || !actionCode) {
        return false;
      }

      // Find the module
      const module = modules.find((m) => m.code === moduleCode);
      if (!module) {
        return false;
      }

      // Check if user has the action
      return module.actions.some((a) => a.code === actionCode);
    },

    hasAction: (moduleCode: string, actionCode: string) => {
      const module = modules.find((m) => m.code === moduleCode);
      return module?.actions.some((a) => a.code === actionCode) ?? false;
    },

    getModule: (code) => modules.find((m) => m.code === code),
  };
}

/**
 * Fetch user authentication and permissions from the backend
 *
 * This is cached per-request using React's cache() function
 * to avoid multiple calls during a single render.
 */
const fetchAuthMe = cache(async (token: string): Promise<AuthMeResponse | null> => {
  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Don't cache this response - always get fresh data
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching auth/me:', error);
    return null;
  }
});

/**
 * Get server-side permissions for the current user
 *
 * This function should only be called in:
 * - Server Components
 * - Server Actions
 * - API Route handlers
 *
 * It reads the JWT from cookies and validates it against the backend.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * export default async function ObjetivosPage() {
 *   const permissions = await getServerPermissions();
 *
 *   if (!permissions.hasModule('objetivos')) {
 *     redirect('/acceso-denegado');
 *   }
 *
 *   // ... render page
 * }
 * ```
 */
export async function getServerPermissions(): Promise<ServerPermissions> {
  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  // No token - not authenticated
  if (!token) {
    return createEmptyPermissions();
  }

  // Validate token and get user info
  const authData = await fetchAuthMe(token);

  if (!authData) {
    return createEmptyPermissions();
  }

  // Map user data
  const user: AuthUser = {
    id: authData.user.id,
    email: authData.user.email,
    firstName: authData.user.firstName,
    lastName: authData.user.lastName,
    isSuperAdmin: authData.user.isSuperAdmin,
  };

  // SuperAdmin has all modules with all actions
  if (authData.user.isSuperAdmin) {
    return createSuperAdminPermissions(user, authData.modules);
  }

  // Regular user with specific modules and actions
  return createUserPermissions(user, authData.modules);
}

/**
 * Require authentication - throws error if not authenticated
 *
 * @example
 * ```tsx
 * export async function updateObjetivo(id: string, data: FormData) {
 *   const permissions = await requireAuth();
 *   // ... user is definitely authenticated here
 * }
 * ```
 */
export async function requireAuth(): Promise<ServerPermissions> {
  const permissions = await getServerPermissions();

  if (!permissions.isAuthenticated) {
    throw new Error('Autenticación requerida');
  }

  return permissions;
}

/**
 * Require a specific module - throws error if no access
 *
 * @example
 * ```tsx
 * export default async function ObjetivosPage() {
 *   const permissions = await requireModule('objetivos');
 *   // ... user definitely has access to objetivos module
 * }
 * ```
 */
export async function requireModule(
  moduleCode: string
): Promise<ServerPermissions> {
  const permissions = await requireAuth();

  if (!permissions.hasModule(moduleCode)) {
    throw new Error(`No tienes acceso al módulo: ${moduleCode}`);
  }

  return permissions;
}

/**
 * Require a specific action/permission - throws error if not allowed
 *
 * @example
 * ```tsx
 * export async function createObjetivo(data: FormData) {
 *   const permissions = await requirePermission('objetivos:create');
 *   // ... user definitely can create objetivos
 * }
 * ```
 */
export async function requirePermission(
  permission: string,
  context?: PermissionContext
): Promise<ServerPermissions> {
  const permissions = await requireAuth();

  if (!permissions.can(permission, context)) {
    throw new Error(`No tienes permiso para: ${permission}`);
  }

  return permissions;
}

/**
 * Require a specific action in a module - throws error if not allowed
 *
 * @example
 * ```tsx
 * export async function createObjetivo(data: FormData) {
 *   const permissions = await requireAction('objetivos', 'create');
 *   // ... user definitely can create objetivos
 * }
 * ```
 */
export async function requireAction(
  moduleCode: string,
  actionCode: string
): Promise<ServerPermissions> {
  const permissions = await requireAuth();

  if (!permissions.hasAction(moduleCode, actionCode)) {
    throw new Error(`No tienes permiso para: ${moduleCode}:${actionCode}`);
  }

  return permissions;
}

/**
 * Require SuperAdmin access - throws error if not SuperAdmin
 *
 * @example
 * ```tsx
 * export async function deleteUser(userId: string) {
 *   await requireSuperAdmin();
 *   // ... user is definitely SuperAdmin
 * }
 * ```
 */
export async function requireSuperAdmin(): Promise<ServerPermissions> {
  const permissions = await requireAuth();

  if (!permissions.isSuperAdmin) {
    throw new Error('Se requiere acceso de SuperAdmin');
  }

  return permissions;
}
