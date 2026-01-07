import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function PQRPage() {
  try {
    await requireModule('pqr');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canCreate = permissions.can('pqr:create');
  const canManage = permissions.can('pqr:manage');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis PQR</h1>
          <p className="text-gray-600">
            Peticiones, Quejas y Reclamos
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <Link
              href="/pqr/manage"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Gestionar PQR
            </Link>
          )}
          {canCreate && (
            <Link
              href="/pqr/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Nueva Solicitud
            </Link>
          )}
        </div>
      </div>

      {/* TODO: Implement in OB-010 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 p-3">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Modulo: Sistema de PQR
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">pqr:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-010</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Aqui se mostraran tus solicitudes de PQR con su estado
          </p>
          <p className="mt-2 text-xs text-blue-600 font-medium">
            Nota: Los cambios de visibilidad (publico/privado) se tramitan via PQR
          </p>
        </div>
      </div>
    </div>
  );
}
