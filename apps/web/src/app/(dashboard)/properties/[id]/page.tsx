import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerPermissions, requirePermission } from '@/lib/permissions.server';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    await requirePermission('copropiedades:read');
  } catch {
    redirect('/properties');
  }

  const permissions = await getServerPermissions();
  const canEdit = permissions.can('copropiedades:update');

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/properties" className="hover:text-gray-700">Copropiedades</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Detalle</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Detalle de Copropiedad</h1>
        <p className="text-gray-600">Copropiedad #{id}</p>
      </div>

      {/* TODO: Implement in OB-003 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Detalle de Copropiedad</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">copropiedades:read</code> | Epic: <span className="font-medium">OB-003</span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/properties" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Volver
        </Link>
        <Link href={`/properties/${id}/apartments`} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Ver Apartamentos
        </Link>
        {canEdit && (
          <Link href={`/properties/${id}/edit`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Editar
          </Link>
        )}
      </div>
    </div>
  );
}
