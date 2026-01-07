import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requireModule } from '@/lib/permissions.server';

export default async function ReportsPage() {
  try {
    await requireModule('reportes');
  } catch {
    redirect('/dashboard');
  }

  const permissions = await getServerPermissions();
  const canRead = permissions.can('reportes:read');
  const canExport = permissions.can('reportes:export');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Reportes</h1>
          <p className="text-gray-600">
            Informes y estadisticas del sistema
          </p>
        </div>
        {canExport && (
          <Link
            href="/reports/export"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Exportar Datos
          </Link>
        )}
      </div>

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {canRead && (
          <>
            <Link
              href="/reports/contributions"
              className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Reporte de Aportes</h3>
                  <p className="text-sm text-gray-500">Por periodo y actividad</p>
                </div>
              </div>
            </Link>

            <Link
              href="/reports/commitments"
              className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Compromisos vs Cumplimiento</h3>
                  <p className="text-sm text-gray-500">Analisis de cumplimiento</p>
                </div>
              </div>
            </Link>

            <Link
              href="/reports/progress"
              className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Avance de Objetivos</h3>
                  <p className="text-sm text-gray-500">Progreso por objetivo</p>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* TODO: Implement in OB-008, OB-009 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 p-3">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            Modulo: Reportes y Dashboard
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Implementacion: <span className="font-medium">OB-008, OB-009</span>
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Dashboard con metricas en tiempo real y generacion de reportes
          </p>
        </div>
      </div>
    </div>
  );
}
