import type { ReactNode } from 'react';

import { getServerPermissions } from '@/lib/permissions.server';

interface ShowForModuleProps {
  /** Module code (e.g., 'objetivos', 'aportes') */
  module: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Server Component that renders children only if user has access to the module
 *
 * @example
 * ```tsx
 * <ShowForModule module="objetivos">
 *   <ObjetivosSection />
 * </ShowForModule>
 *
 * <ShowForModule module="reportes" fallback={<p>Sin acceso</p>}>
 *   <ReportesSection />
 * </ShowForModule>
 * ```
 */
export async function ShowForModule({
  module,
  children,
  fallback = null,
}: ShowForModuleProps) {
  const permissions = await getServerPermissions();

  // SuperAdmin sees everything
  if (permissions.isSuperAdmin) {
    return <>{children}</>;
  }

  // Check module access
  if (!permissions.hasModule(module)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
