import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireSuperAdmin } from '@/lib/permissions.server';

export default async function AdminModulesPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-gray-700">Administracion</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Modulos del Sistema</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Modulos del Sistema</h1>
        <p className="text-gray-600">Administra los modulos disponibles por copropiedad</p>
      </div>

      {/* TODO: Implement in OB-002 */}
      <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Modulos del Sistema</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">SuperAdmin</code> | Epic: <span className="font-medium">OB-002</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Ver todos los modulos del sistema</li>
              <li>Activar/desactivar modulos por copropiedad</li>
              <li>Configurar parametros de modulos</li>
              <li>Ver dependencias entre modulos</li>
            </ul>
          </div>
        </div>
      </div>

      <Link href="/admin" className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Volver
      </Link>
    </div>
  );
}
