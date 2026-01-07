/**
 * Permission-based rendering components
 *
 * These are Server Components that conditionally render content
 * based on the user's permissions.
 *
 * @example
 * ```tsx
 * import { ShowForModule, ShowForPermission, ShowForSuperAdmin } from '@/components/permissions';
 *
 * export default async function DashboardPage() {
 *   return (
 *     <div>
 *       <ShowForModule module="objetivos">
 *         <ObjetivosWidget />
 *       </ShowForModule>
 *
 *       <ShowForPermission permission="aportes:create">
 *         <QuickAporteForm />
 *       </ShowForPermission>
 *
 *       <ShowForSuperAdmin>
 *         <AdminStats />
 *       </ShowForSuperAdmin>
 *     </div>
 *   );
 * }
 * ```
 */

export { ShowForModule } from './ShowForModule';
export { ShowForPermission } from './ShowForPermission';
export { ShowForSuperAdmin } from './ShowForSuperAdmin';
export { ShowForAnyModule } from './ShowForAnyModule';
export { PermissionGate } from './PermissionGate';
export { AccessDenied } from './AccessDenied';
export { ModulePlaceholder } from './ModulePlaceholder';
