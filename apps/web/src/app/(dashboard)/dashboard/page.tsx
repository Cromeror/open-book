import { getServerPermissions } from '@/lib/permissions.server';

export default async function DashboardPage() {
  const permissions = await getServerPermissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {permissions.user?.firstName}
        </h1>
        <p className="text-gray-600">
          Este es tu panel de control de OpenBook
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick stats cards will go here based on permissions */}
        {permissions.hasModule('objetivos') && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Objetivos</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">-</p>
            <p className="mt-1 text-sm text-gray-600">Objetivos activos</p>
          </div>
        )}

        {permissions.hasModule('aportes') && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Aportes</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">-</p>
            <p className="mt-1 text-sm text-gray-600">Aportes este mes</p>
          </div>
        )}

        {permissions.hasModule('pqr') && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">PQR</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">-</p>
            <p className="mt-1 text-sm text-gray-600">Solicitudes pendientes</p>
          </div>
        )}

        {permissions.isSuperAdmin && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Usuarios</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">-</p>
            <p className="mt-1 text-sm text-gray-600">Usuarios registrados</p>
          </div>
        )}
      </div>

      {permissions.isSuperAdmin && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Modo SuperAdmin:</strong> Tienes acceso completo a todas las
            funcionalidades del sistema.
          </p>
        </div>
      )}
    </div>
  );
}
