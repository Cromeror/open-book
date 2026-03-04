import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout';
import { ModuleRegistryProvider } from '@/lib/module-registry.context';
import { SessionContextProvider } from '@/lib/session-context.context';
import { getNavFromModules, getModulesForContext, getUserForHeader } from '@/lib/nav-filter.server';
import { getServerPermissions } from '@/lib/permissions.server';
import { fetchAuthMe } from '@/lib/http-api/auth-api';
import { getGrpcClient } from '@/lib/grpc';
import type { SessionContext } from '@/types/business';
import { SessionContextLogger } from './session-context-logger';

async function getUserState() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  try {
    const grpc = getGrpcClient();
    return await grpc.userState.getUserState(token);
  } catch {
    return null;
  }
}

async function getSessionContext(): Promise<SessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  try {
    const grpc = getGrpcClient();
    return await grpc.sessionContext.getSessionContext(token);
  } catch {
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const permissions = await getServerPermissions();

  if (!permissions.isAuthenticated) {
    redirect('/login');
  }

  const navItems = getNavFromModules(permissions);
  const modules = getModulesForContext(permissions);
  const user = getUserForHeader(permissions);

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value ?? '';

  const [userState, sessionContext, authMe] = await Promise.all([
    getUserState(),
    getSessionContext(),
    fetchAuthMe(token),
  ]);

  const condominiums = authMe?.condominiums ?? [];
  const selectedCondominium = userState?.selectedCondominiumId
    ? condominiums.find((c) => c.id === userState.selectedCondominiumId) ?? condominiums[0] ?? null
    : condominiums[0] ?? null;

  return (
    <ModuleRegistryProvider
      initialModules={modules}
      initialIsSuperAdmin={permissions.isSuperAdmin}
    >
      <SessionContextProvider initialContext={sessionContext}>
        <SessionContextLogger context={sessionContext} />
        <DashboardShell
          user={user}
          navItems={navItems}
          isSuperAdmin={permissions.isSuperAdmin}
          condominiums={condominiums}
          selectedCondominium={selectedCondominium}
        >
          {children}
        </DashboardShell>
      </SessionContextProvider>
    </ModuleRegistryProvider>
  );
}
