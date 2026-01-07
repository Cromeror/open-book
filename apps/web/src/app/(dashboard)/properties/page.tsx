import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function PropertiesPage() {
  try {
    await requireModule('copropiedades');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canCreate = permissions.isSuperAdmin; // Only SuperAdmin can create properties

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Copropiedades</h1>
          <p className="text-gray-600">
            Gestion de copropiedades del sistema
          </p>
        </div>
        {canCreate && (
          <Link
            href="/properties/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nueva Copropiedad
          </Link>
        )}
      </div>

      {/* TODO: Implement in OB-003 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-teal-100 p-3">
            <svg
              className="h-6 w-6 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Modulo: Copropiedades
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">copropiedades:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-003</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Lista de copropiedades con sus apartamentos asociados
          </p>
        </div>
      </div>
    </div>
  );
}
