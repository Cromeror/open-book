import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { PermissionsManager } from './permissions-manager';

interface Module {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  publicAccountConsent: boolean;
  consentDate?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedUsers {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function getModules(): Promise<Module[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return [];

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/permissions/modules`, {
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

async function getUsers(): Promise<PaginatedUsers> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/users?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    return response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  }
}

export default async function AdminPermissionsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const [modules, usersData] = await Promise.all([getModules(), getUsers()]);

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-gray-700">Administracion</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Gestion de Permisos</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Permisos</h1>
        <p className="text-gray-600">Configura los permisos granulares del sistema</p>
      </div>

      {/* Modules Overview */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Modulos del Sistema</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`rounded-lg border p-3 ${
                module.isActive
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{module.name}</span>
                <span className={`h-2 w-2 rounded-full ${
                  module.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <code className="text-xs text-gray-500">{module.code}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Manager (Client Component) */}
      <PermissionsManager
        initialModules={modules}
        initialUsers={usersData.data}
      />

      <Link href="/admin" className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Volver
      </Link>
    </div>
  );
}
