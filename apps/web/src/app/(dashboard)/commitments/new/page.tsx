import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

export default async function CreateCommitmentPage() {
  try {
    await requirePermission('compromisos:create');
  } catch {
    redirect('/commitments');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/commitments" className="hover:text-gray-700">
            Compromisos
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Nuevo</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Crear Compromiso</h1>
        <p className="text-gray-600">
          Registra un nuevo compromiso de aporte para un apartamento
        </p>
      </div>

      {/* TODO: Implement in OB-006 */}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Formulario: Crear Compromiso
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">compromisos:create</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-006</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Campos del formulario:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Apartamento</li>
              <li>Actividad de recaudo</li>
              <li>Monto comprometido</li>
              <li>Fecha limite</li>
              <li>Notas (opcional)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/commitments"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          disabled
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        >
          Crear Compromiso
        </button>
      </div>
    </div>
  );
}
