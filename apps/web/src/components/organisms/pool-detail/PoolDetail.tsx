'use client';

import type { UserPool } from '../pool-list';

export interface PoolMemberInfo {
  id: string;
  userId: string;
  addedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PoolPermissionInfo {
  id: string;
  modulePermissionId: string;
  grantedAt: string;
  modulePermission?: {
    id: string;
    code: string;
    name: string;
    module?: {
      id: string;
      name: string;
      code: string;
    };
  };
}

export interface PoolDetailProps {
  pool: UserPool;
  members: PoolMemberInfo[];
  permissions: PoolPermissionInfo[];
  loadingMembers?: boolean;
  loadingPermissions?: boolean;
  loading?: boolean;
  onEdit: (pool: UserPool) => void;
  onToggleStatus: () => void;
  onBack: () => void;
  onManageMembers: () => void;
  onManagePermissions: () => void;
  onRemoveMember: (memberId: string) => void;
  onRevokePermission: (permissionId: string) => void;
}

export function PoolDetail({
  pool,
  members,
  permissions,
  loadingMembers = false,
  loadingPermissions = false,
  loading = false,
  onEdit,
  onToggleStatus,
  onBack,
  onManageMembers,
  onManagePermissions,
  onRemoveMember,
  onRevokePermission,
}: PoolDetailProps) {
  // Group permissions by module
  const permissionsByModule = new Map<string, PoolPermissionInfo[]>();
  for (const perm of permissions) {
    const moduleCode = perm.modulePermission?.module?.code || 'unknown';
    const existing = permissionsByModule.get(moduleCode) || [];
    existing.push(perm);
    permissionsByModule.set(moduleCode, existing);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{pool.name}</h1>
                <p className="text-sm text-gray-500">
                  {pool.description || 'Sin descripcion'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  pool.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {pool.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 p-4 bg-gray-50">
          <button
            type="button"
            onClick={() => onEdit(pool)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onToggleStatus}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
              pool.isActive
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {pool.isActive ? 'Desactivar' : 'Activar'}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Miembros</p>
          <p className="text-2xl font-semibold text-gray-900">{members.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Permisos</p>
          <p className="text-2xl font-semibold text-gray-900">{permissions.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Creado</p>
          <p className="text-lg font-medium text-gray-900">
            {new Date(pool.createdAt).toLocaleDateString('es-CO')}
          </p>
        </div>
      </div>

      {/* Members Section */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Miembros del Pool</h3>
            <p className="text-sm text-gray-500">Usuarios que pertenecen a este pool</p>
          </div>
          <button
            type="button"
            onClick={onManageMembers}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Agregar Miembro
          </button>
        </div>
        <div className="p-4">
          {loadingMembers ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay miembros en este pool</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium">
                      {member.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.user?.name || 'Usuario desconocido'}
                      </p>
                      <p className="text-xs text-gray-500">{member.user?.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveMember(member.userId)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Remover miembro"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Permissions Section (grouped by module) */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Permisos Asignados</h3>
            <p className="text-sm text-gray-500">Permisos que heredan los miembros de este pool</p>
          </div>
          <button
            type="button"
            onClick={onManagePermissions}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Agregar Permiso
          </button>
        </div>
        <div className="p-4">
          {loadingPermissions ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay permisos asignados a este pool</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(permissionsByModule.entries()).map(([moduleCode, modulePerms]) => {
                const moduleName = modulePerms[0]?.modulePermission?.module?.name || moduleCode;
                return (
                  <div key={moduleCode} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">{moduleName}</span>
                      <code className="text-xs text-gray-400">{moduleCode}</code>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {modulePerms.map((perm) => (
                        <div
                          key={perm.id}
                          className="flex items-center gap-1 rounded bg-white border border-gray-200 px-2 py-1"
                        >
                          <code className="text-xs text-gray-700">
                            {perm.modulePermission?.code || 'unknown'}
                          </code>
                          <button
                            type="button"
                            onClick={() => onRevokePermission(perm.id)}
                            className="ml-1 text-red-500 hover:text-red-700"
                            title="Revocar permiso"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PoolDetail;
