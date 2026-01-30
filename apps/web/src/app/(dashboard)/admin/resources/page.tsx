import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ResourcesManager } from './resources-manager';
import { ContentLayout } from '@/components/layout';
import type { Resource } from '@/types/business';
import type { PaginatedResponse } from '@/lib/http-api/resources-api';

async function getResources(): Promise<PaginatedResponse<Resource>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/resources`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok)
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    return response.json();
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
  }
}

export default async function AdminResourcesPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const resources = await getResources();

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
      <ResourcesManager initialResources={resources} />
    </ContentLayout>
  );
}
