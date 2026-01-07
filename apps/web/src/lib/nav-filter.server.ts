import 'server-only';

import type { ServerPermissions } from './permissions.server';
import type { NavItem, ModuleWithActions } from './types/modules';

/**
 * Generate navigation items from user's modules
 *
 * This function creates navigation items dynamically from the modules
 * returned by /api/auth/me. The modules are already filtered by the backend
 * based on user permissions.
 *
 * @param permissions - Server permissions object containing modules
 * @returns Navigation items derived from user's modules
 */
export function getNavFromModules(permissions: ServerPermissions): NavItem[] {
  // Dashboard is always visible (handled separately in Sidebar)
  // Modules are already filtered by backend permissions

  return permissions.modules
    .slice()
    .sort((a, b) => a.nav.order - b.nav.order)
    .map((m) => ({
      path: m.nav.path,
      label: m.label,
      icon: m.icon,
      module: m.code,
    }));
}

/**
 * Get user modules for the ModuleRegistry context
 */
export function getModulesForContext(permissions: ServerPermissions): ModuleWithActions[] {
  return permissions.modules;
}

/**
 * Get user data for the header component
 * Returns null if not authenticated
 */
export function getUserForHeader(permissions: ServerPermissions): {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
} | null {
  if (!permissions.isAuthenticated || !permissions.user) {
    return null;
  }

  return permissions.user;
}
