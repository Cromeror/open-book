import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

export default async function ExportReportsPage() {
  try {
    await requirePermission('reportes:export');
  } catch {
    redirect('/reports');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/reports" className="hover:text-gray-700">
            Reportes
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Exportar</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Exportar Datos</h1>
        <p className="text-gray-600">
          Descarga reportes en diferentes formatos
        </p>
      </div>

      {/* TODO: Implement in OB-009 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 p-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Exportar Reportes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">reportes:export</code> | Epic: <span className="font-medium">OB-009</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <p className="font-medium text-gray-500">Formatos disponibles:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong>PDF:</strong> Con marca de agua (fecha/hora/usuario)</li>
              <li><strong>Excel:</strong> Para analisis en hojas de calculo</li>
              <li><strong>CSV:</strong> Datos crudos para procesamiento</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/reports"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
