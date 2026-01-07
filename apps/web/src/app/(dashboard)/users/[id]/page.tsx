import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requirePermission } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    await requirePermission('users:read');
  } catch {
    redirect('/users');
  }

  const permissions = await getServerPermissions();
  const canEdit = permissions.can('users:update');
  const canManage = permissions.can('users:manage');
  const isSuperAdmin = permissions.isSuperAdmin;

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/users" className="hover:text-gray-700">Usuarios</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Detalle</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Detalle del Usuario</h1>
        <p className="text-gray-600">Usuario #{id}</p>
      </div>

      {/* TODO: Implement in OB-002 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Detalle de Usuario</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">users:read</code> | Epic: <span className="font-medium">OB-002</span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/users" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Volver
        </Link>
        {isSuperAdmin && (
          <Link href={`/users/${id}/permissions`} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Gestionar Permisos
          </Link>
        )}
        {canManage && (
          <Link href={`/users/${id}/privacy`} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cambiar Privacidad
          </Link>
        )}
        {canEdit && (
          <Link href={`/users/${id}/edit`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Editar
          </Link>
        )}
      </div>
    </div>
  );
}
