import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

export default async function AuditExportPage() {
  try {
    await requirePermission('auditoria:export');
  } catch {
    redirect('/audit');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/audit" className="hover:text-gray-700">Auditoria</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Exportar</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Exportar Registros de Auditoria</h1>
        <p className="text-gray-600">Genera reportes de auditoria en diferentes formatos</p>
      </div>

      {/* TODO: Implement in OB-009 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Exportar Auditoria</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">auditoria:export</code> | Epic: <span className="font-medium">OB-009</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Seleccionar rango de fechas</li>
              <li>Filtrar por tipo de evento</li>
              <li>Formato: PDF, Excel, CSV</li>
              <li>Incluir firma digital</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/audit" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </Link>
        <button disabled className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed">
          Generar Exportacion
        </button>
      </div>
    </div>
  );
}
