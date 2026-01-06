import type { ReactNode } from 'react';

import { getServerPermissions } from '@/lib/permissions.server';

interface ShowForSuperAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Server Component that renders children only for SuperAdmin
 *
 * @example
 * ```tsx
 * <ShowForSuperAdmin>
 *   <AdminPanel />
 * </ShowForSuperAdmin>
 *
 * <ShowForSuperAdmin fallback={<p>Solo administradores</p>}>
 *   <SystemSettings />
 * </ShowForSuperAdmin>
 * ```
 */
export async function ShowForSuperAdmin({
  children,
  fallback = null,
}: ShowForSuperAdminProps) {
  const permissions = await getServerPermissions();

  if (!permissions.isSuperAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
