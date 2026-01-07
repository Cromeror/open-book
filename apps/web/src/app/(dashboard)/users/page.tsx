import { redirect } from 'next/navigation';

import { requireModule } from '@/lib/permissions.server';

export default async function UsersPage() {
  try {
    await requireModule('users');
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-600">Gestion de usuarios del sistema</p>
      </div>

      {/* TODO: Implement in OB-002 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 p-3">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">Modulo: Usuarios</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">users:read</code> | Epic: <span className="font-medium">OB-002</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Lista de usuarios con sus roles y permisos
          </p>
        </div>
      </div>
    </div>
  );
}
