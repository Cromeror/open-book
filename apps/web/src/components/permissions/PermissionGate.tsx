import type { ReactNode } from 'react';

import { getServerPermissions } from '@/lib/permissions.server';
import type { ModuleCode, PermissionContext, PermissionString } from '@/lib/types';

import { AccessDenied } from './AccessDenied';

interface BaseProps {
  children: ReactNode;
  /** Custom fallback component. If not provided, AccessDenied is shown */
  fallback?: ReactNode;
  /** If true, renders nothing instead of AccessDenied when access is denied */
  silent?: boolean;
}

type PermissionGateProps = BaseProps &
  (
    | { type: 'permission'; permission: PermissionString | string; context?: PermissionContext }
    | { type: 'module'; module: ModuleCode | string }
    | { type: 'superAdmin' }
  );

/**
 * Server Component that gates content based on permissions, modules, or superAdmin status
 * Unlike ShowFor* components, this shows an AccessDenied message by default
 *
 * @example
 * ```tsx
 * // Gate by permission
 * <PermissionGate type="permission" permission="objetivos:create">
 *   <CreateObjectiveForm />
 * </PermissionGate>
 *
 * // Gate by module
 * <PermissionGate type="module" module="reportes">
 *   <ReportsSection />
 * </PermissionGate>
 *
 * // Gate for superAdmin only
 * <PermissionGate type="superAdmin">
 *   <AdminPanel />
 * </PermissionGate>
 *
 * // Silent mode (no AccessDenied message)
 * <PermissionGate type="permission" permission="aportes:manage" silent>
 *   <ManageButton />
 * </PermissionGate>
 *
 * // Custom fallback
 * <PermissionGate
 *   type="module"
 *   module="auditoria"
 *   fallback={<p>Contact admin for access</p>}
 * >
 *   <AuditLogs />
 * </PermissionGate>
 * ```
 */
export async function PermissionGate(props: PermissionGateProps) {
  const { children, fallback, silent = false } = props;
  const permissions = await getServerPermissions();

  let hasAccess = false;
  let requiredPermission: string | undefined;

  // SuperAdmin always has access
  if (permissions.isSuperAdmin) {
    hasAccess = true;
  } else {
    switch (props.type) {
      case 'permission':
        hasAccess = permissions.can(props.permission, props.context);
        requiredPermission = props.permission;
        break;
      case 'module':
        hasAccess = permissions.hasModule(props.module);
        requiredPermission = `module:${props.module}`;
        break;
      case 'superAdmin':
        hasAccess = false;
        requiredPermission = 'superAdmin';
        break;
    }
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (silent) {
    return null;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return <AccessDenied requiredPermission={requiredPermission} />;
}
