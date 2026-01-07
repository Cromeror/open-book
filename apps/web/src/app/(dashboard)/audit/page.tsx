import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function AuditPage() {
  try {
    await requireModule('auditoria');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canExport = permissions.can('auditoria:export');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria</h1>
          <p className="text-gray-600">
            Registro de actividades del sistema
          </p>
        </div>
        {canExport && (
          <Link href="/audit/export" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Exportar Registros
          </Link>
        )}
      </div>

      {/* TODO: Implement in OB-009 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Log de Auditoria</h3>
          <p className="mt-1 text-sm text-gray-500">
            Modulo: <code className="rounded bg-gray-200 px-1">auditoria</code> | Epic: <span className="font-medium">OB-009</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Filtrar por fecha, usuario, accion</li>
              <li>Ver detalles de cada evento</li>
              <li>Buscar por entidad afectada</li>
              <li>Inmutabilidad de registros</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/audit/users" className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm">
          <h3 className="font-medium text-gray-900">Por Usuario</h3>
          <p className="mt-1 text-sm text-gray-500">Actividad de usuarios</p>
        </Link>
        <Link href="/audit/financial" className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm">
          <h3 className="font-medium text-gray-900">Financiero</h3>
          <p className="mt-1 text-sm text-gray-500">Aportes y compromisos</p>
        </Link>
        <Link href="/audit/system" className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm">
          <h3 className="font-medium text-gray-900">Sistema</h3>
          <p className="mt-1 text-sm text-gray-500">Configuracion y permisos</p>
        </Link>
      </div>
    </div>
  );
}
