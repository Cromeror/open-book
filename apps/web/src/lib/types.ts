/**
 * Permission and module types for the frontend
 *
 * Re-exports types from @/types/business and ./types/modules.ts
 * and provides utility functions for runtime permission checks.
 */

// Re-export shared types from business types
export type { Scope, PermissionContext } from '@/types/business';

// Type alias for compatibility
export type PermissionScope = 'own' | 'copropiedad' | 'all';

// Auth response types (transport types, re-exported for convenience)
export type { AuthUser } from './permissions.server';

/**
 * Auth me response from API
 * This is a transport type, not a business type
 */
export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleWithActions[];
  condominiums: Array<{
    id: string;
    name: string;
    isPrimary: boolean;
  }>;
}

// Re-export all module types
export * from './types/modules';

// Import for local use
import type { ModuleWithActions } from './types/modules';

// ============================================
// Runtime Validation Helpers
// ============================================

/**
 * Check if user has access to a module
 * Runtime validation using generic strings
 */
export function hasModule(
  modules: ModuleWithActions[],
  moduleCode: string
): boolean {
  return modules.some((m) => m.code === moduleCode);
}

/**
 * Check if user has a specific action in a module
 * Action code = Permission code
 */
export function hasAction(
  modules: ModuleWithActions[],
  moduleCode: string,
  actionCode: string
): boolean {
  const module = modules.find((m) => m.code === moduleCode);
  return module?.actions.some((a) => a.code === actionCode) ?? false;
}

/**
 * Get action settings with type casting
 */
export function getActionSettings<T>(
  modules: ModuleWithActions[],
  moduleCode: string,
  actionCode: string
): T | undefined {
  const module = modules.find((m) => m.code === moduleCode);
  const action = module?.actions.find((a) => a.code === actionCode);
  return action?.settings as T | undefined;
}
