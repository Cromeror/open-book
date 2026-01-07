import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireSuperAdmin } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserPermissionsPage({ params }: Props) {
  const { id } = await params;

  try {
    await requireSuperAdmin();
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
          <span className="text-gray-900">Permisos</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Gestionar Permisos</h1>
        <p className="text-gray-600">Solo SuperAdmin puede gestionar permisos</p>
      </div>

      {/* TODO: Implement in OB-002 */}
      <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Gestion de Permisos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">SuperAdmin</code> | Epic: <span className="font-medium">OB-002</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Asignar/remover modulos</li>
              <li>Configurar permisos granulares</li>
              <li>Definir scope (all, copropiedad, own)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/users/${id}`} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Volver
        </Link>
      </div>
    </div>
  );
}
