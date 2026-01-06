import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/layout';
import { filterNavItems, getUserForHeader } from '@/lib/nav-filter.server';
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

  // Filter navigation items based on user permissions
  const navItems = filterNavItems(permissions);

  // Get user data for header
  const user = getUserForHeader(permissions);

  return (
    <DashboardShell
      user={user}
      navItems={navItems}
      isSuperAdmin={permissions.isSuperAdmin}
    >
      {children}
    </DashboardShell>
  );
}
