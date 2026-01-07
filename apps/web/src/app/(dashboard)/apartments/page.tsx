import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function ApartmentsPage() {
  try {
    await requireModule('apartamentos');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canCreate = permissions.can('apartamentos:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apartamentos</h1>
          <p className="text-gray-600">
            Gestion de apartamentos y residentes
          </p>
        </div>
        {canCreate && (
          <Link
            href="/apartments/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nuevo Apartamento
          </Link>
        )}
      </div>

      {/* TODO: Implement in OB-003 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-cyan-100 p-3">
            <svg
              className="h-6 w-6 text-cyan-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Modulo: Apartamentos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">apartamentos:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-003</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Lista de apartamentos con sus residentes asignados
          </p>
        </div>
      </div>
    </div>
  );
}
