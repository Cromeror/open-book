import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { PoolsManager } from './pools-manager';

interface ModulePermission {
  id: string;
  code: string;
  name: string;
  description?: string;
}

interface SystemModule {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions?: ModulePermission[];
}

async function getSystemModules(): Promise<SystemModule[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return [];

  try {
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

export default async function AdminPoolsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const systemModules = await getSystemModules();

  return (
    <div className="space-y-6">
      <PoolsManager initialModules={systemModules} />

      <Link href="/admin" className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Volver a Administracion
      </Link>
    </div>
  );
}
