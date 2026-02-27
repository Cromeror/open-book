import type { ReactNode } from 'react';

import { getServerPermissions } from '@/lib/permissions.server';

interface ShowForPermissionProps {
  /** Permission string in format "module:action" (e.g., "goals:create") */
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Server Component that renders children only if user has the specific permission
 *
 * @example
 * ```tsx
 * <ShowForPermission permission="goals:create">
 *   <Button>Crear Objetivo</Button>
 * </ShowForPermission>
 * ```
 */
export async function ShowForPermission({
  permission,
  children,
  fallback = null,
}: ShowForPermissionProps) {
  const permissions = await getServerPermissions();

  // SuperAdmin sees everything
  if (permissions.isSuperAdmin) {
    return <>{children}</>;
  }

  // Check permission
  if (!permissions.can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
