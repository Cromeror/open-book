import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function ContributionsPage() {
  try {
    await requireModule('aportes');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canCreate = permissions.can('aportes:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aportes Reales</h1>
          <p className="text-gray-600">
            Registro y seguimiento de aportes reales de los residentes
          </p>
        </div>
        {canCreate && (
          <Link
            href="/contributions/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Registrar Aporte
          </Link>
        )}
      </div>

      {/* TODO: Implement in OB-007 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 p-3">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Modulo: Aportes Reales
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">aportes:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-007</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Aqui se mostrara la lista de aportes con su estado (pendiente, confirmado, anulado)
          </p>
          <p className="mt-2 text-xs text-red-600 font-medium">
            IMPORTANTE: Los aportes son inmutables - nunca se eliminan, solo se anulan con justificacion
          </p>
        </div>
      </div>
    </div>
  );
}
