/**
 * Permission and module types for the frontend
 *
 * Re-exports types from @openbook/business-core and ./types/modules.ts
 * and provides utility functions for runtime permission checks.
 */

// Re-export shared types from business-core
export type { AuthMeResponse, AuthUser } from '@openbook/business-core/auth';
export type { Scope, PermissionContext } from '@openbook/business-core/permissions';

// Type alias for compatibility
export type PermissionScope = 'own' | 'copropiedad' | 'all';

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
