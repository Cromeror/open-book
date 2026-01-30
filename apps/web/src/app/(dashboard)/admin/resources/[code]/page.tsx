import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import type { Resource } from '@/types/business';
import { ResourceDetailView } from './resource-detail-view';

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
    return response.json();
  } catch (error) {
    console.error('Error fetching resource:', error);
    return null;
  }
}

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ViewResourcePage({ params }: Props) {
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
          <h1 className="text-2xl font-semibold text-gray-900">{resource.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            <code>{resource.code}</code>
          </p>
        </div>

        <ResourceDetailView resource={resource} />
      </div>
    </ContentLayout>
  );
}
