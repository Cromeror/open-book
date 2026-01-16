import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { SettingsManager } from './settings-manager';
import { ContentLayout } from '@/components/layout';

export default async function AdminSettingsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <ContentLayout
      footer={
        <Link href="/admin" className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Volver
        </Link>
      }
    >
      <SettingsManager />
    </ContentLayout>
  );
}
