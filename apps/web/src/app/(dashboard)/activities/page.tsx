import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function ActivitiesPage() {
  try {
    await requireModule('activities');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canCreate = permissions.can('activities:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividades</h1>
          <p className="text-gray-600">
            Gestiona las actividades de recaudo de la copropiedad
          </p>
        </div>
        {canCreate && (
          <Link
            href="/activities/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nueva Actividad
          </Link>
        )}
      </div>

      {/* TODO: Implement in OB-005 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 p-3">
            <svg
              className="h-6 w-6 text-orange-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Modulo: Actividades de Recaudo
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">activities:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-005</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400 max-w-md mx-auto">
            <p className="font-medium text-gray-500">Tipos de actividades:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Rifas</li>
              <li>Donaciones</li>
              <li>Eventos comunitarios</li>
              <li>Ventas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
