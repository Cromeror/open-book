import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/permissions.server';
import { ContentLayout } from '@/components/layout';
import { NewRoleClient } from './new-role-client';

export default async function NewRolePage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <ContentLayout
      footer={
        <Link
          href="/admin/roles"
          className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver a Roles
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Crear Rol</h1>
          <p className="text-sm text-gray-500 mt-1">Ingrese los datos del nuevo rol</p>
        </div>
        <NewRoleClient />
      </div>
    </ContentLayout>
  );
}
