import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import type { Organization } from '@/types/business/organization.types';

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

export default async function OrganizationViewsDetailPage({
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

  return (
    <ContentLayout
      footer={
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/organizations/${organization.code}`}
            className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Volver a Organizacion
          </Link>
          <Link
            href="/admin/organization-views"
            className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Todas las Vistas
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/organization-views" className="hover:text-blue-600">
              Configuracion de Vistas
            </Link>
            <span>/</span>
            <span>{organization.name}</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Vistas de {organization.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure que recursos y datos puede ver esta organizacion.
          </p>
        </div>

        {organization.integration && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
              {organization.integration.name}
            </span>
            {organization.externalId && (
              <code className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-mono text-amber-700">
                ID: {organization.externalId}
              </code>
            )}
          </div>
        )}

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <p className="text-sm text-gray-500">
            La configuracion de vistas para esta organizacion se implementara proximamente.
          </p>
        </div>
      </div>
    </ContentLayout>
  );
}
