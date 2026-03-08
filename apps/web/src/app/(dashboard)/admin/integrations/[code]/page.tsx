import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import type { Integration } from '@/types/business/integration.types';
import { IntegrationDetailView } from './integration-detail-view';

async function getIntegration(code: string): Promise<Integration | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  try {
    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_API_URL}/admin/integrations/${code}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const { code } = await params;
  const integration = await getIntegration(code);

  if (!integration) {
    notFound();
  }

  return (
    <ContentLayout
      footer={
        <Link
          href="/admin/integrations"
          className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a Integraciones
        </Link>
      }
    >
      <IntegrationDetailView integration={integration} />
    </ContentLayout>
  );
}
