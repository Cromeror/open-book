import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePermission } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;

  try {
    await requirePermission('users:update');
  } catch {
    redirect(`/users/${id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/users" className="hover:text-gray-700">Usuarios</Link>
          <span className="mx-2">/</span>
          <Link href={`/users/${id}`} className="hover:text-gray-700">Detalle</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Editar</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
      </div>

      {/* TODO: Implement in OB-002 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Formulario: Editar Usuario</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">users:update</code> | Epic: <span className="font-medium">OB-002</span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/users/${id}`} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </Link>
        <button disabled className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
