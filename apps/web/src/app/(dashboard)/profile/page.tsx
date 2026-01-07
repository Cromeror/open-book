import Link from 'next/link';

import { getServerPermissions } from '@/lib/permissions.server';

export default async function ProfilePage() {
  const permissions = await getServerPermissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu informacion personal</p>
      </div>

      {/* TODO: Implement in OB-002 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Perfil del Usuario Actual</h3>
          <p className="mt-1 text-sm text-gray-500">
            Acceso: <code className="rounded bg-gray-200 px-1">Autenticado</code> | Epic: <span className="font-medium">OB-002</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Nombre, email, telefono</li>
              <li>Apartamento(s) asociado(s)</li>
              <li>Copropiedad actual</li>
              <li>Preferencias de visibilidad</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/profile/edit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Editar Perfil
        </Link>
        <Link href="/profile/notifications" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Preferencias de Notificaciones
        </Link>
      </div>

      {permissions.isSuperAdmin && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            <strong>SuperAdmin:</strong> Puedes gestionar usuarios desde <Link href="/users" className="underline">Usuarios</Link>
          </p>
        </div>
      )}
    </div>
  );
}
