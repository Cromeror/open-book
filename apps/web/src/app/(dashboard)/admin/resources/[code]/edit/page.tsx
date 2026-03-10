import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import { PageTitle } from '@/components/molecules';
import type { Resource, ResourceHttpMethod, ResourceHttpMethodLink, HttpMethod } from '@/types/business';
import type { Integration } from '@/types/business/integration.types';
import { ResourceEditForm } from './resource-edit-form';

/**
 * Map a raw resource_http_method_link from the API to the frontend type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiLink(raw: any): ResourceHttpMethodLink {
  return {
    id: raw.id,
    rel: raw.rel,
    targetHttpMethodId: raw.targetHttpMethodId,
    paramMappings: (raw.paramMappings ?? []).map((pm: any) => ({
      responseField: pm.responseField,
      urlParam: pm.urlParam,
    })),
  };
}

/**
 * Map junction table response to frontend ResourceHttpMethod type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiResource(raw: any): Resource {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    description: raw.description ?? null,
    templateUrl: raw.templateUrl,
    integrationId: raw.integrationId ?? null,
    integration: raw.integration ?? null,
    requiresExternalAuth: raw.requiresExternalAuth ?? false,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    httpMethods: (raw.httpMethods ?? []).map((rhm: any) => ({
      id: rhm.id,
      name: rhm.httpMethod?.method?.toLowerCase() ?? '',
      method: (rhm.httpMethod?.method ?? 'GET') as HttpMethod,
      urlPattern: '',
      payloadMetadata: rhm.payloadMetadata ? JSON.stringify(rhm.payloadMetadata) : undefined,
      responseMetadata: rhm.responseMetadata ? JSON.stringify(rhm.responseMetadata) : undefined,
      isActive: rhm.isActive,
      outboundLinks: (rhm.outboundLinks ?? []).map(mapApiLink),
    } satisfies ResourceHttpMethod)),
  };
}

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value ?? null;
}

async function getResource(code: string, token: string): Promise<Resource | null> {
  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/resources/${code}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return mapApiResource(await response.json());
  } catch {
    return null;
  }
}

async function getAllResources(token: string): Promise<Resource[]> {
  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/resources`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const body = await response.json();
    // Response is paginated: { data: [], pagination: {} }
    return (body.data ?? []).map(mapApiResource);
  } catch {
    return [];
  }
}

async function getIntegrations(token: string): Promise<Integration[]> {
  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/integrations?isActive=true`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const body = await response.json();
    return body.data ?? [];
  } catch {
    return [];
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
  const token = await getToken();

  if (!token) {
    redirect('/login');
  }

  const [resource, allResources, integrations] = await Promise.all([
    getResource(code, token),
    getAllResources(token),
    getIntegrations(token),
  ]);

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
        <PageTitle
          title="Configuración detallada del recurso"
          tooltip={
            <>
              <p className="font-semibold text-gray-800 mb-1">¿Cómo funciona?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Template URL</strong>: define la estructura de la URL del recurso.</li>
                <li><strong>Métodos HTTP</strong>: cada método habilitado representa una acción disponible (listar, crear, actualizar, etc.).</li>
                <li><strong>Links de salida</strong>: configuran los hipervínculos HATEOAS que se inyectan en las respuestas del API para guiar la navegación entre recursos.</li>
              </ul>
            </>
          }
        />

        <ResourceEditForm resource={resource} allResources={allResources} integrations={integrations} />
      </div>
    </ContentLayout>
  );
}
