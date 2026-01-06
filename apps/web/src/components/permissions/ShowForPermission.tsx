import type { ReactNode } from 'react';

import { getServerPermissions } from '@/lib/permissions.server';
import type { PermissionContext, PermissionString } from '@/lib/types';

interface ShowForPermissionProps {
  permission: PermissionString | string;
  context?: PermissionContext;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Server Component that renders children only if user has the specific permission
 *
 * @example
 * ```tsx
 * <ShowForPermission permission="objetivos:create">
 *   <Button>Crear Objetivo</Button>
 * </ShowForPermission>
 *
 * <ShowForPermission
 *   permission="objetivos:update"
 *   context={{ copropiedadId: objetivo.copropiedadId }}
 * >
 *   <Button>Editar</Button>
 * </ShowForPermission>
 * ```
 */
export async function ShowForPermission({
  permission,
  context,
  children,
  fallback = null,
}: ShowForPermissionProps) {
  const permissions = await getServerPermissions();

  // SuperAdmin sees everything
  if (permissions.isSuperAdmin) {
    return <>{children}</>;
  }

  // Check permission
  if (!permissions.can(permission, context)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
