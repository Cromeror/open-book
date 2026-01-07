import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireSuperAdmin } from '@/lib/permissions.server';

export default async function CreatePropertyPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/properties');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/properties" className="hover:text-gray-700">
            Copropiedades
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Nueva</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Copropiedad</h1>
        <p className="text-gray-600">
          Crear una nueva copropiedad en el sistema
        </p>
      </div>

      {/* TODO: Implement in OB-003 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Formulario: Crear Copropiedad</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">SuperAdmin</code> | Epic: <span className="font-medium">OB-003</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Nombre de la copropiedad</li>
              <li>NIT</li>
              <li>Direccion</li>
              <li>Ciudad</li>
              <li>Administrador asignado</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/properties" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </Link>
        <button disabled className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed">
          Crear Copropiedad
        </button>
      </div>
    </div>
  );
}
