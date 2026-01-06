import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function GoalsPage() {
  try {
    await requireModule('goals');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canCreate = permissions.can('goals:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Objetivos</h1>
          <p className="text-gray-600">
            Gestiona los objetivos de recaudo de la copropiedad
          </p>
        </div>
        {canCreate && (
          <Link
            href="/goals/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Crear Objetivo
          </Link>
        )}
      </div>

      {/* TODO: Implement in OB-004 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 p-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Modulo: Objetivos de Recaudo
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">goals:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-004</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Aqui se mostrara la lista de objetivos de recaudo con su estado y progreso
          </p>
        </div>
      </div>
    </div>
  );
}
