import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import type { Organization } from '@/types/business/organization.types';
import type { Integration } from '@/types/business/integration.types';
import { EditOrganizationClient } from './pageOnlyClient';

async function getOrganization(code: string): Promise<Organization | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  try {
    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_API_URL}/admin/organizations/${code}`,
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

async function getIntegrations(): Promise<Integration[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return [];

  try {
    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_API_URL}/admin/integrations?isActive=true`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    );
    if (!response.ok) return [];
    const body = await response.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

export default async function EditOrganizationPage({
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
  const [organization, integrations] = await Promise.all([
    getOrganization(code),
    getIntegrations(),
  ]);

  if (!organization) {
    notFound();
  }

  return (
    <ContentLayout
      footer={
        <Link
          href={`/admin/organizations/${code}`}
          className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver al detalle
        </Link>
      }
    >
      <EditOrganizationClient organization={organization} integrations={integrations} />
    </ContentLayout>
  );
}
