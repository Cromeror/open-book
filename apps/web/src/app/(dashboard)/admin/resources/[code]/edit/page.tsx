import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import { getGrpcClient } from '@/lib/grpc';
import type { Resource } from '@/types/business';
import { ResourceEditForm } from './resource-edit-form';

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

/**
 * Fetch active capability presets via gRPC
 */
async function getCapabilityPresets() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return [];

  try {
    const grpc = getGrpcClient();
    return await grpc.capabilityPresets.getActivePresets(token);
  } catch (error) {
    console.error('Error fetching capability presets:', error);
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
  const [resource, presets] = await Promise.all([
    getResource(code),
    getCapabilityPresets(),
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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Editar Recurso</h1>
          <p className="text-sm text-gray-500 mt-1">
            <code>{resource.code}</code>
          </p>
        </div>

        <ResourceEditForm resource={resource} presets={presets} />
      </div>
    </ContentLayout>
  );
}
