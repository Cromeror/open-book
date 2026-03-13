import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { publicEnv } from '@/config/env';
import { ContentLayout } from '@/components/layout';
import { EditRoleClient } from './edit-role-client';
import type { CapudataRole } from '@/components/organisms/captudata-role-list';

async function getRole(id: string): Promise<CapudataRole | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/admin/pools/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: Props) {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  const { id } = await params;
  const role = await getRole(id);

  if (!role) {
    notFound();
  }

  return (
    <ContentLayout
      footer={
        <Link
          href={`/admin/roles/${id}`}
          className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver al Rol
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Editar Rol</h1>
          <p className="text-sm text-gray-500 mt-1">{role.name}</p>
        </div>
        <EditRoleClient role={role} />
      </div>
    </ContentLayout>
  );
}
