import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ResourcesManager } from './resources-manager';
import { ContentLayout } from '@/components/layout';
import type { Resource, ResourceHttpMethod, HttpMethod } from '@/types/business';
import type { PaginatedResponse } from '@/lib/http-api/resources-api';

/**
 * Map junction table response to frontend ResourceHttpMethod type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiResource(raw: any): Resource {
  return {
    ...raw,
    httpMethods: (raw.httpMethods ?? []).map((rhm: any) => ({
      name: (rhm.method ?? 'GET').toLowerCase(),
      method: (rhm.method ?? 'GET') as HttpMethod,
      urlPattern: '',
      payloadMetadata: rhm.payloadMetadata ? JSON.stringify(rhm.payloadMetadata) : undefined,
      responseMetadata: rhm.responseMetadata ? JSON.stringify(rhm.responseMetadata) : undefined,
      isActive: rhm.isActive,
    } satisfies ResourceHttpMethod)),
  };
}

async function getResources(): Promise<PaginatedResponse<Resource>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };

  try {
    const url = `${publicEnv.NEXT_PUBLIC_API_URL}/admin/resources`;
    console.log(`[resources-page] → GET ${url}`);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    console.log(`[resources-page] ← ${response.status}`);

    if (!response.ok)
      return { data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };

    const data = await response.json();
    console.log(`[resources-page]   total: ${data.pagination?.total ?? 0} recursos`);
    return {
      ...data,
      data: (data.data ?? []).map(mapApiResource),
    };
  } catch (error) {
    console.error('[resources-page] Error fetching resources:', error);
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
