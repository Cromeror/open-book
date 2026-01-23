import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { ContentLayout } from '@/components/layout';
import { AuditReportsTabs } from './audit-reports-tabs';

export default async function AuditReportsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <ContentLayout
      footer={
        <Link
          href="/admin"
          className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Auditoría y Reportes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitoreo de actividad, generación de reportes y análisis de métricas del sistema
          </p>
        </div>

        <AuditReportsTabs />
      </div>
    </ContentLayout>
  );
}
