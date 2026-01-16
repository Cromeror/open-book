import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ModulesManager } from './modules-manager';
import { ContentLayout } from '@/components/layout';
import type {
  ModulePermission,
  NavConfig,
  ModuleAction,
  ModuleType,
} from '@/components/organisms';

interface Module {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  type: ModuleType;
  entity?: string;
  endpoint?: string;
  component?: string;
  navConfig?: NavConfig;
  actionsConfig?: ModuleAction[];
  order: number;
  tags?: string[];
  isActive: boolean;
  permissions?: ModulePermission[];
}

async function getModules(): Promise<Module[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return [];

  try {
    // Use the new admin/modules endpoint that returns all modules (including inactive)
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/modules`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Error fetching modules:', error);
    return [];
  }
}

export default async function AdminModulesPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const modules = await getModules();

  return (
    <ContentLayout
      header={
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modulos del Sistema</h1>
          <p className="text-gray-600">Visualiza y administra los modulos disponibles en el sistema</p>
        </div>
      }
      footer={
        <Link href="/admin" className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Volver
        </Link>
      }
    >
      {/* Modules Manager (Client Component) */}
      <ModulesManager initialModules={modules} />
    </ContentLayout>
  );
}
