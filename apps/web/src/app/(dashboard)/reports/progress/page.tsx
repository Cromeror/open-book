import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

export default async function ProgressReportPage() {
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
          <span className="text-gray-900">Avance</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Avance de Objetivos</h1>
        <p className="text-gray-600">
          Progreso de cada objetivo de recaudo
        </p>
      </div>

      {/* TODO: Implement in OB-008 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Reporte: Avance de Objetivos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">reportes:read</code> | Epic: <span className="font-medium">OB-008</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Porcentaje de avance por objetivo</li>
              <li>Monto recaudado vs meta</li>
              <li>Dias restantes</li>
              <li>Proyeccion de cumplimiento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
