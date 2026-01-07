import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function NotificationsPage() {
  try {
    await requireModule('notificaciones');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canManage = permissions.can('notificaciones:manage');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">
            Centro de notificaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/notifications/settings" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Configuracion
          </Link>
          {canManage && (
            <Link href="/notifications/send" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Enviar Notificacion
            </Link>
          )}
        </div>
      </div>

      {/* TODO: Implement in OB-010 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Lista de Notificaciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            Modulo: <code className="rounded bg-gray-200 px-1">notificaciones</code> | Epic: <span className="font-medium">OB-010</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Notificaciones no leidas</li>
              <li>Filtrar por tipo</li>
              <li>Marcar como leidas</li>
              <li>Eliminar notificaciones</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-medium text-gray-900">Recientes</h3>
          <p className="mt-1 text-sm text-gray-500">Ultimas 24 horas</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">--</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-medium text-gray-900">Sin Leer</h3>
          <p className="mt-1 text-sm text-gray-500">Pendientes de revision</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">--</p>
        </div>
      </div>
    </div>
  );
}
