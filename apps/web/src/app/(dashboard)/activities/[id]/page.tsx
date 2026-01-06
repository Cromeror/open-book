import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requirePermission } from '@/lib/permissions.server';

interface ActivityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { id } = await params;

  try {
    await requirePermission('activities:read');
  } catch {
    redirect('/activities');
  }

  const permissions = await getServerPermissions();
  const canUpdate = permissions.can('activities:update');
  const canManage = permissions.can('activities:manage');

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/activities" className="hover:text-gray-700">
            Actividades
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Detalle</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle de Actividad</h1>
            <p className="text-gray-600">ID: {id}</p>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <Link
                href={`/activities/${id}/targets`}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Configurar Metas
              </Link>
            )}
            {canUpdate && (
              <Link
                href={`/activities/${id}/edit`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Editar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* TODO: Implement in OB-005 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900">
                Informacion de la Actividad
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Permiso requerido: <code className="rounded bg-gray-200 px-1">activities:read</code>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Implementacion: <span className="font-medium">OB-005</span>
              </p>
              <div className="mt-4 text-left text-xs text-gray-400">
                <p className="font-medium text-gray-500">Informacion a mostrar:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Tipo de actividad</li>
                  <li>Nombre y descripcion</li>
                  <li>Objetivo vinculado</li>
                  <li>Periodo de vigencia</li>
                  <li>Estado (activa, pausada, finalizada)</li>
                  <li>Compromisos asociados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900">Progreso</h3>
              <p className="mt-2 text-xs text-gray-400">
                Meta vs recaudado
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Implementacion: <span className="font-medium">OB-008</span>
              </p>
            </div>
          </div>

          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900">Estadisticas</h3>
              <p className="mt-2 text-xs text-gray-400">
                Compromisos y aportes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
