import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { IntegrationsManager } from './integrations-manager';
import { ContentLayout } from '@/components/layout';
import type { Integration } from '@/types/business/integration.types';
import type { PaginatedResponse } from '@/lib/http-api/integrations-api';

async function getIntegrations(): Promise<PaginatedResponse<Integration>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };

  try {
    const url = `${publicEnv.NEXT_PUBLIC_API_URL}/admin/integrations`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }

    return response.json();
  } catch (error) {
    console.error('[integrations-page] Error fetching integrations:', error);
    return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
  }
}

export default async function AdminIntegrationsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const integrations = await getIntegrations();

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
      <IntegrationsManager initialIntegrations={integrations} />
    </ContentLayout>
  );
}
