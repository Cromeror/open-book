/**
 * Permission and module types for the frontend
 *
 * Re-exports types from @/types/business and ./types/modules.ts
 * and provides utility functions for runtime permission checks.
 */

// Auth response types (transport types, re-exported for convenience)
export type { AuthUser } from './permissions.server';

export const CONDOMINIUM_ROLE = {
  MANAGER: 'manager',
  RESIDENT: 'resident',
} as const;

export type CondominiumRole = typeof CONDOMINIUM_ROLE[keyof typeof CONDOMINIUM_ROLE];

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
  modules: ModuleWithActionsResponse[];
  condominiums: Array<{
    id: string;
    name: string;
    isPrimary: boolean;
    role: CondominiumRole;
  }>;
}

// Re-export all module types
export * from './types/modules';

// Import for local use
import type { ModuleWithActionsResponse } from './types/modules';

// ============================================
// Runtime Validation Helpers
// ============================================

/**
 * Check if user has access to a module
 * Runtime validation using generic strings
 */
export function hasModule(
  modules: ModuleWithActionsResponse[],
  moduleCode: string
): boolean {
  return modules.some((m) => m.code === moduleCode);
}

/**
 * Check if user has a specific action in a module
 * Having the module in the response means the user has permission
 */
export function hasAction(
  modules: ModuleWithActionsResponse[],
  moduleCode: string,
  _actionCode: string
): boolean {
  return modules.some((m) => m.code === moduleCode);
}
