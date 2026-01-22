import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/layout';
import { ModuleRegistryProvider } from '@/lib/module-registry.context';
import { getNavFromModules, getModulesForContext, getUserForHeader } from '@/lib/nav-filter.server';
import { getServerPermissions } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { getGrpcClient } from '@/lib/grpc';
import type { Condominium } from '@/components/molecules';

interface CondominiumApiItem {
  id: string;
  name: string;
  address: string;
  city: string;
  nit?: string;
  unitCount: number;
  isPrimary: boolean;
}

/**
 * Fetch user state from gRPC service
 * Contains user preferences like selected condominium
 */
async function getUserState() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  try {
    const grpc = getGrpcClient();
    return await grpc.userState.getUserState(token);
  } catch (error) {
    console.error('Error fetching user state:', error);
    return null;
  }
}

/**
 * Fetch condominiums for the current user from the API
 */
async function getCondominiums(): Promise<{
  condominiums: Condominium[];
  primaryCondominium: Condominium | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return { condominiums: [], primaryCondominium: null };
  }

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/condominiums`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { condominiums: [], primaryCondominium: null };
    }

    const data: CondominiumApiItem[] = await response.json();

    // Map to simpler Condominium type for the selector
    const condominiums: Condominium[] = data.map((c) => ({
      id: c.id,
      name: c.name,
    }));

    // Find primary condominium (first one marked as primary, or just first one)
    const primaryItem = data.find((c) => c.isPrimary) || data[0] || null;
    const primaryCondominium = primaryItem
      ? { id: primaryItem.id, name: primaryItem.name }
      : null;

    return { condominiums, primaryCondominium };
  } catch (error) {
    console.error('Error fetching condominiums:', error);
    return { condominiums: [], primaryCondominium: null };
  }
}

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

  // Get condominiums for the sidebar selector
  const { condominiums, primaryCondominium } = await getCondominiums();

  // Get user state (selected condominium, preferences)
  const userState = await getUserState();

  // Resolve selected condominium from UserState or fall back to primary
  const selectedCondominium = userState?.selectedCondominiumId
    ? condominiums.find((c) => c.id === userState.selectedCondominiumId) ||
      primaryCondominium
    : primaryCondominium;

  return (
    <ModuleRegistryProvider
      initialModules={modules}
      initialIsSuperAdmin={permissions.isSuperAdmin}
    >
      <DashboardShell
        user={user}
        navItems={navItems}
        isSuperAdmin={permissions.isSuperAdmin}
        condominiums={condominiums}
        selectedCondominium={selectedCondominium}
      >
        {children}
      </DashboardShell>
    </ModuleRegistryProvider>
  );
}
