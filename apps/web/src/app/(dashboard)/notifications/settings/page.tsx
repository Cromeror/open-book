import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireModule } from '@/lib/permissions.server';

export default async function NotificationSettingsPage() {
  try {
    await requireModule('notificaciones');
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/notifications" className="hover:text-gray-700">Notificaciones</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Configuracion</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion de Notificaciones</h1>
        <p className="text-gray-600">Personaliza como recibes notificaciones</p>
      </div>

      {/* TODO: Implement in OB-010 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Configuracion de Notificaciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            Modulo: <code className="rounded bg-gray-200 px-1">notificaciones</code> | Epic: <span className="font-medium">OB-010</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Notificaciones por email</li>
              <li>Notificaciones push</li>
              <li>Frecuencia de resumenes</li>
              <li>Tipos de eventos a notificar</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/notifications" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </Link>
        <button disabled className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed">
          Guardar Configuracion
        </button>
      </div>
    </div>
  );
}
