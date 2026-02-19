import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import type { Resource, ResourceHttpMethod, HttpMethod } from '@/types/business';
import { ResourceEditForm } from './resource-edit-form';

/**
 * Map junction table response to frontend ResourceHttpMethod type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiResource(raw: any): Resource {
  return {
    ...raw,
    httpMethods: (raw.httpMethods ?? []).map((rhm: any) => ({
      name: rhm.httpMethod?.method?.toLowerCase() ?? '',
      method: (rhm.httpMethod?.method ?? 'GET') as HttpMethod,
      urlPattern: '',
      payloadMetadata: rhm.payloadMetadata ? JSON.stringify(rhm.payloadMetadata) : undefined,
      responseMetadata: rhm.responseMetadata ? JSON.stringify(rhm.responseMetadata) : undefined,
      isActive: rhm.isActive,
    } satisfies ResourceHttpMethod)),
  };
}

async function getResource(code: string): Promise<Resource | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/resources/${code}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const raw = await response.json();
    return mapApiResource(raw);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return null;
  }
}

interface Props {
  params: Promise<{ code: string }>;
}

export default async function EditResourcePage({ params }: Props) {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const { code } = await params;
  const resource = await getResource(code);

  if (!resource) {
    notFound();
  }

  return (
    <ContentLayout
      footer={
        <Link
          href="/admin/resources"
          className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a Recursos
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Editar Recurso</h1>
          <p className="text-sm text-gray-500 mt-1">
            <code>{resource.code}</code>
          </p>
        </div>

        <ResourceEditForm resource={resource} />
      </div>
    </ContentLayout>
  );
}
