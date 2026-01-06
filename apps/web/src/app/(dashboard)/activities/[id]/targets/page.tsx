import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

interface ActivityTargetsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityTargetsPage({ params }: ActivityTargetsPageProps) {
  const { id } = await params;

  try {
    await requirePermission('activities:manage');
  } catch {
    redirect(`/activities/${id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/activities" className="hover:text-gray-700">
            Actividades
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/activities/${id}`} className="hover:text-gray-700">
            Detalle
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Metas</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Configurar Metas</h1>
        <p className="text-gray-600">
          Define las metas opcionales para esta actividad
        </p>
      </div>

      {/* TODO: Implement in OB-005 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 p-3">
            <svg
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Configuracion de Metas
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">activities:manage</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-005</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Tipos de metas:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><span className="font-medium">Meta monetaria</span> - Monto a recaudar</li>
              <li><span className="font-medium">Meta de participacion</span> - Numero de participantes</li>
              <li><span className="font-medium">Meta de boletas</span> - Para rifas (cantidad a vender)</li>
            </ul>
            <p className="mt-3 text-gray-500">
              Las metas son opcionales y sirven para medir el exito de la actividad.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Metas Actuales</h3>
        <div className="text-center text-sm text-gray-500 py-8">
          No hay metas configuradas para esta actividad
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/activities/${id}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </Link>
        <button
          disabled
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        >
          Agregar Meta
        </button>
      </div>
    </div>
  );
}
