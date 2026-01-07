import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function CommitmentsPage() {
  try {
    await requireModule('compromisos');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canCreate = permissions.can('compromisos:create');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compromisos</h1>
          <p className="text-gray-600">
            Gestiona los compromisos de aporte de los apartamentos
          </p>
        </div>
        {canCreate && (
          <Link
            href="/commitments/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Crear Compromiso
          </Link>
        )}
      </div>

      {/* TODO: Implement in OB-006 */}
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Modulo: Compromisos de Aporte
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">compromisos:read</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-006</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Aqui se mostrara la lista de compromisos con su estado (pendiente, parcial, cumplido)
          </p>
          <p className="mt-2 text-xs text-amber-600 font-medium">
            Nota: Compromiso ≠ Aporte. Un compromiso es una intencion de pago, no dinero real.
          </p>
        </div>
      </div>
    </div>
  );
}
