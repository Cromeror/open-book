import Link from 'next/link';

export default function NotificationPreferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/profile" className="hover:text-gray-700">Mi Perfil</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Notificaciones</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Preferencias de Notificaciones</h1>
        <p className="text-gray-600">Configura como quieres recibir notificaciones</p>
      </div>

      {/* TODO: Implement in OB-010 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Preferencias de Notificaciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            Acceso: <code className="rounded bg-gray-200 px-1">Autenticado</code> | Epic: <span className="font-medium">OB-010</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Email: nuevos compromisos, aportes, PQR</li>
              <li>Push: recordatorios de pago</li>
              <li>In-app: todas las notificaciones</li>
              <li>Frecuencia: inmediata, diaria, semanal</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/profile" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Volver
        </Link>
        <button disabled className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed">
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
}
