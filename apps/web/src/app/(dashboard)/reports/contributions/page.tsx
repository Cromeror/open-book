import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

export default async function ContributionsReportPage() {
  try {
    await requirePermission('reportes:read');
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
          <span className="text-gray-900">Aportes</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Reporte de Aportes</h1>
        <p className="text-gray-600">
          Analisis de aportes por periodo y actividad
        </p>
      </div>

      {/* TODO: Implement in OB-009 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Reporte: Aportes por Periodo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">reportes:read</code> | Epic: <span className="font-medium">OB-009</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Filtros por fecha, actividad, apartamento</li>
              <li>Totales y subtotales</li>
              <li>Graficos de tendencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
