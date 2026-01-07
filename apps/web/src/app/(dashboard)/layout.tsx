import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/layout';
import { ModuleRegistryProvider } from '@/lib/module-registry.context';
import { getNavFromModules, getModulesForContext, getUserForHeader } from '@/lib/nav-filter.server';
import { getServerPermissions } from '@/lib/permissions.server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const permissions = await getServerPermissions();

  // Redirect to login if not authenticated
  if (!permissions.isAuthenticated) {
    redirect('/login');
  }

  // Generate navigation items from user's modules
  const navItems = getNavFromModules(permissions);

  // Get modules for client-side context
  const modules = getModulesForContext(permissions);

  // Get user data for header
  const user = getUserForHeader(permissions);

  return (
    <ModuleRegistryProvider
      initialModules={modules}
      initialIsSuperAdmin={permissions.isSuperAdmin}
    >
      <DashboardShell
        user={user}
        navItems={navItems}
        isSuperAdmin={permissions.isSuperAdmin}
      >
        {children}
      </DashboardShell>
    </ModuleRegistryProvider>
  );
}
