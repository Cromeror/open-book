import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

interface EditActivityPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const { id } = await params;

  try {
    await requirePermission('activities:update');
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
          <span className="text-gray-900">Editar</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Editar Actividad</h1>
        <p className="text-gray-600">ID: {id}</p>
      </div>

      {/* TODO: Implement in OB-005 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 p-3">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Formulario: Editar Actividad
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso requerido: <code className="rounded bg-gray-200 px-1">activities:update</code>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-005</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Campos editables:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Nombre de la actividad</li>
              <li>Descripcion</li>
              <li>Fecha fin</li>
              <li>Estado (activa, pausada, finalizada)</li>
            </ul>
            <p className="mt-2 font-medium text-gray-500">No editables:</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>Tipo de actividad</li>
              <li>Objetivo vinculado</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/activities/${id}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          disabled
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
