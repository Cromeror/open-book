/**
 * Admin Roles Page
 *
 * NOTA IMPORTANTE: "Roles" en la UI corresponde a "Pools" en la API.
 *
 * Los Pools (User Pools) son grupos de usuarios con permisos idénticos.
 * Según la documentación (OB-002-C), los pools permiten:
 *
 * - Agrupar usuarios con permisos similares
 * - Asignar módulos a grupos (PoolModule)
 * - Asignar permisos granulares a grupos (PoolPermission)
 * - Gestionar membresías (UserPoolMember)
 *
 * Endpoints de la API:
 * - GET/POST /api/admin/pools - Listar/crear pools
 * - GET/PATCH/DELETE /api/admin/pools/:id - CRUD de pool específico
 * - GET/POST /api/admin/pools/:id/members - Gestionar miembros
 * - DELETE /api/admin/pools/:id/members/:userId - Eliminar miembro
 * - GET/POST /api/admin/pools/:id/modules - Módulos del pool
 * - DELETE /api/admin/pools/:id/modules/:moduleId - Quitar módulo
 * - Permisos granulares se gestionan via /api/admin/permissions
 *
 * El término "Roles" se usa en la UI para mayor claridad al usuario final,
 * pero internamente el sistema trabaja con "Pools de Usuarios".
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireSuperAdmin } from '@/lib/permissions.server';

export default async function AdminRolesPage() {
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
          <span className="text-gray-900">Roles</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Roles</h1>
        <p className="text-gray-600">Define y gestiona los roles del sistema (pools de usuarios) con sus permisos asociados</p>
      </div>

      {/* Banner de construccion */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-amber-800">Modulo en construccion</h3>
            <p className="mt-1 text-sm text-amber-700">
              Este modulo esta siendo desarrollado. Proximamente podras gestionar roles completos.
            </p>
          </div>
        </div>
      </div>

      {/* Info sobre el modulo */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Que son los Roles?</h3>
        <p className="text-sm text-blue-800 mb-3">
          Los <strong>Roles</strong> (internamente llamados &quot;Pools&quot;) son grupos de usuarios con permisos identicos.
          Facilitan la gestion cuando multiples usuarios necesitan los mismos accesos.
        </p>

        <h4 className="text-sm font-semibold text-blue-900 mb-2">Funcionalidades planeadas:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Crear roles:</strong> Define grupos como &quot;Administradores&quot;, &quot;Tesoreros&quot;, &quot;Residentes&quot;</li>
          <li><strong>Asignar usuarios:</strong> Agrega o elimina miembros de cada rol</li>
          <li><strong>Asignar modulos:</strong> Define a que modulos tiene acceso el rol</li>
          <li><strong>Permisos granulares:</strong> Configura permisos especificos (crear, leer, editar, eliminar) por modulo</li>
          <li><strong>Scopes:</strong> Limita permisos a recursos propios o de una copropiedad especifica</li>
        </ul>

        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            <strong>Nota tecnica:</strong> En la API, los roles se gestionan via <code className="bg-blue-100 px-1 rounded">/api/admin/pools</code>
          </p>
        </div>
      </div>

      <Link href="/admin" className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Volver
      </Link>
    </div>
  );
}
