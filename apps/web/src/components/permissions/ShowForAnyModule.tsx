import type { ReactNode } from 'react';

import { getServerPermissions } from '@/lib/permissions.server';
import type { ModuleCode } from '@/lib/types';

interface ShowForAnyModuleProps {
  modules: (ModuleCode | string)[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Server Component that renders children if user has access to ANY of the specified modules
 *
 * @example
 * ```tsx
 * <ShowForAnyModule modules={['objetivos', 'aportes']}>
 *   <FinanceSection />
 * </ShowForAnyModule>
 * ```
 */
export async function ShowForAnyModule({
  modules,
  children,
  fallback = null,
}: ShowForAnyModuleProps) {
  const permissions = await getServerPermissions();

  // SuperAdmin sees everything
  if (permissions.isSuperAdmin) {
    return <>{children}</>;
  }

  // Check if user has access to any of the modules
  const hasAccess = modules.some((module) => permissions.hasModule(module));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
