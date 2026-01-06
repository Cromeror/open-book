import 'server-only';

import type { ServerPermissions } from './permissions.server';
import type { NavItem } from './nav-config';
import { NAV_CONFIG } from './nav-config';

/**
 * Filter navigation items based on user permissions
 * This runs on the server to ensure navigation is secure
 *
 * @param permissions - Server permissions object
 * @returns Filtered navigation items
 */
export function filterNavItems(permissions: ServerPermissions): NavItem[] {
  const filterItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => {
        // SuperAdmin sees everything
        if (permissions.isSuperAdmin) {
          return true;
        }

        // Items only for SuperAdmin
        if (item.superAdminOnly) {
          return false;
        }

        // Check module access if required
        if (item.module && !permissions.hasModule(item.module)) {
          return false;
        }

        // Check permission if required
        if (item.permission && !permissions.can(item.permission)) {
          return false;
        }

        return true;
      })
      .map((item) => ({
        ...item,
        // Recursively filter children
        children: item.children ? filterItems(item.children) : undefined,
      }))
      // Remove items with no visible children (if they had children)
      .filter((item) => !item.children || item.children.length > 0);
  };

  return filterItems(NAV_CONFIG);
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
