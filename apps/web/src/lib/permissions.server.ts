import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';

import { publicEnv } from '@/config/env';

import type {
  AuthMeResponse,
  ModuleCode,
  PermissionContext,
  PermissionString,
  UserPermission,
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
 */
export interface ServerPermissions {
  userId: string | null;
  user: AuthUser | null;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  modules: ModuleCode[];
  permissions: UserPermission[];

  /**
   * Check if user has access to a module
   */
  hasModule: (module: ModuleCode | string) => boolean;

  /**
   * Check if user has a specific permission
   * Format: "module:action" (e.g., "objetivos:create")
   */
  can: (permission: PermissionString | string, context?: PermissionContext) => boolean;

  /**
   * Check if user has permission within a specific scope
   */
  canInScope: (
    permission: PermissionString | string,
    scopeId: string
  ) => boolean;
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
    permissions: [],
    hasModule: () => false,
    can: () => false,
    canInScope: () => false,
  };
}

/**
 * Create permissions object for SuperAdmin
 */
function createSuperAdminPermissions(user: AuthUser): ServerPermissions {
  return {
    userId: user.id,
    user,
    isSuperAdmin: true,
    isAuthenticated: true,
    modules: [], // SuperAdmin doesn't need explicit modules
    permissions: [], // SuperAdmin doesn't need explicit permissions
    hasModule: () => true, // SuperAdmin has access to all modules
    can: () => true, // SuperAdmin can do everything
    canInScope: () => true, // SuperAdmin can do everything in any scope
  };
}

/**
 * Create permissions object for regular user
 */
function createUserPermissions(
  user: AuthUser,
  modules: ModuleCode[],
  permissions: UserPermission[]
): ServerPermissions {
  const userId = user.id;

  return {
    userId,
    user,
    isSuperAdmin: false,
    isAuthenticated: true,
    modules,
    permissions,

    hasModule: (module: ModuleCode | string) => {
      return modules.includes(module as ModuleCode);
    },

    can: (permission: PermissionString | string, context?: PermissionContext) => {
      const [module, action] = permission.split(':');

      // Must have access to the module first
      if (!modules.includes(module as ModuleCode)) {
        return false;
      }

      // Find matching permission
      const perm = permissions.find(
        (p) => p.module === module && p.action === action
      );

      if (!perm) {
        return false;
      }

      // If no context needed, just check if permission exists
      if (!context) {
        return true;
      }

      // Check scope-based permissions
      if (perm.scope === 'all') {
        return true;
      }

      if (perm.scope === 'copropiedad' && context.copropiedadId) {
        return perm.scopeId === context.copropiedadId;
      }

      if (perm.scope === 'own' && context.resourceOwnerId) {
        return context.resourceOwnerId === userId;
      }

      return false;
    },

    canInScope: (permission: PermissionString | string, scopeId: string) => {
      const [module, action] = permission.split(':');

      // Must have access to the module first
      if (!modules.includes(module as ModuleCode)) {
        return false;
      }

      // Find matching permission
      const perm = permissions.find(
        (p) => p.module === module && p.action === action
      );

      if (!perm) {
        return false;
      }

      // Check scope
      if (perm.scope === 'all') {
        return true;
      }

      if (perm.scope === 'copropiedad') {
        return perm.scopeId === scopeId;
      }

      return false;
    },
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

  // SuperAdmin bypass
  if (authData.user.isSuperAdmin) {
    return createSuperAdminPermissions(user);
  }

  // Regular user with specific permissions
  return createUserPermissions(
    user,
    authData.modules,
    authData.permissions
  );
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
  module: ModuleCode | string
): Promise<ServerPermissions> {
  const permissions = await requireAuth();

  if (!permissions.hasModule(module)) {
    throw new Error(`No tienes acceso al módulo: ${module}`);
  }

  return permissions;
}

/**
 * Require a specific permission - throws error if not allowed
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
  permission: PermissionString | string,
  context?: PermissionContext
): Promise<ServerPermissions> {
  const permissions = await requireAuth();

  if (!permissions.can(permission, context)) {
    throw new Error(`No tienes permiso para: ${permission}`);
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
