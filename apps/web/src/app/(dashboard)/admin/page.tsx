import { redirect } from 'next/navigation';

import { requireSuperAdmin } from '@/lib/permissions.server';

export default async function AdminPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administracion</h1>
        <p className="text-gray-600">
          Panel de administracion del sistema (Solo SuperAdmin)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <a
          href="/admin/pools"
          className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h3 className="font-semibold text-gray-900">Pools de Usuarios</h3>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona los grupos de usuarios y sus asignaciones
          </p>
        </a>

        <a
          href="/admin/permissions"
          className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h3 className="font-semibold text-gray-900">Gestion de Permisos</h3>
          <p className="mt-2 text-sm text-gray-600">
            Configura los permisos del sistema
          </p>
        </a>

        <a
          href="/admin/modules"
          className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <h3 className="font-semibold text-gray-900">Modulos del Sistema</h3>
          <p className="mt-2 text-sm text-gray-600">
            Administra los modulos disponibles
          </p>
        </a>
      </div>
    </div>
  );
}
