import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';

interface OrganizationSummary {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  integration?: { id: string; name: string; code: string } | null;
}

async function getOrganizations(): Promise<OrganizationSummary[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return [];

  try {
    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_API_URL}/admin/organizations?limit=100`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) return [];
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch {
    return [];
  }
}

export default async function OrganizationViewsPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const organizations = await getOrganizations();

  return (
    <ContentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Configuracion de Vistas
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administre lo que cada organizacion puede ver en el sistema.
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            No hay organizaciones configuradas.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Link
                key={org.id}
                href={`/admin/organization-views/${org.code}`}
                className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {org.name}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      org.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {org.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <code className="text-xs text-gray-500 font-mono">{org.code}</code>
                {org.integration && (
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {org.integration.name}
                    </span>
                  </div>
                )}
                <div className="mt-3 text-xs text-blue-600 group-hover:underline">
                  Configurar vistas →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
