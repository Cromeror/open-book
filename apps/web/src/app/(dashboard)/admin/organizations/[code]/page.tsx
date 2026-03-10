import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import type { Organization, ExternalUser } from '@/types/business/organization.types';
import { OrganizationDetailView } from './organization-detail-view';

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

async function getExternalUsers(
  code: string,
): Promise<{ users: ExternalUser[]; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return { users: [], error: 'No access token' };

  try {
    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_API_URL}/admin/organizations/${code}/external-users`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return { users: [], error: `HTTP ${response.status}` };
    }

    return response.json();
  } catch (err) {
    return { users: [], error: (err as Error).message };
  }
}

export default async function OrganizationDetailPage({
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
  const organization = await getOrganization(code);

  if (!organization) {
    notFound();
  }

  // Only fetch external users if the organization has credentials and an integration
  let externalUsers: ExternalUser[] = [];
  let externalUsersError: string | undefined;

  if (organization.hasCredentials && organization.integration) {
    const result = await getExternalUsers(code);
    externalUsers = result.users;
    externalUsersError = result.error;
  }

  return (
    <ContentLayout
      footer={
        <Link
          href="/admin/organizations"
          className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a Organizaciones
        </Link>
      }
    >
      <OrganizationDetailView
        organization={organization}
        externalUsers={externalUsers}
        externalUsersError={externalUsersError}
      />
    </ContentLayout>
  );
}
