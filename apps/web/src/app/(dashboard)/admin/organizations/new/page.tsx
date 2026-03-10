import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import type { Integration } from '@/types/business/integration.types';
import { NewOrganizationClient } from './pageOnlyClient';

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

export default async function NewOrganizationPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const integrations = await getIntegrations();

  return (
    <ContentLayout>
      <NewOrganizationClient integrations={integrations} />
    </ContentLayout>
  );
}
