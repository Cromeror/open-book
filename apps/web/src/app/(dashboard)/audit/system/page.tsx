import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireSuperAdmin } from '@/lib/permissions.server';

export default async function AuditSystemPage() {
  try {
    await requireSuperAdmin();
  } catch {
    redirect('/audit');
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/audit" className="hover:text-gray-700">Auditoria</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Sistema</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Auditoria de Sistema</h1>
        <p className="text-gray-600">Configuracion y cambios de permisos</p>
      </div>

      {/* TODO: Implement in OB-009 */}
      <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900">Vista: Auditoria de Sistema</h3>
          <p className="mt-1 text-sm text-gray-500">
            Permiso: <code className="rounded bg-gray-200 px-1">SuperAdmin</code> | Epic: <span className="font-medium">OB-009</span>
          </p>
          <div className="mt-4 text-left text-xs text-gray-400">
            <ul className="list-inside list-disc space-y-1">
              <li>Cambios de configuracion global</li>
              <li>Asignacion/revocacion de permisos</li>
              <li>Creacion de copropiedades</li>
              <li>Cambios en roles de usuarios</li>
            </ul>
          </div>
        </div>
      </div>

      <Link href="/audit" className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Volver
      </Link>
    </div>
  );
}
