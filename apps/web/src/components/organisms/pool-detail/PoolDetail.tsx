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

export interface PoolModuleInfo {
  id: string;
  moduleId: string;
  grantedAt: string;
  module?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
}

export interface PoolDetailProps {
  pool: UserPool;
  members: PoolMemberInfo[];
  modules: PoolModuleInfo[];
  loadingMembers?: boolean;
  loadingModules?: boolean;
  loading?: boolean;
  onEdit: (pool: UserPool) => void;
  onToggleStatus: () => void;
  onBack: () => void;
  onManageMembers: () => void;
  onManageModules: () => void;
  onRemoveMember: (memberId: string) => void;
  onRemoveModule: (moduleId: string) => void;
}

export function PoolDetail({
  pool,
  members,
  modules,
  loadingMembers = false,
  loadingModules = false,
  loading = false,
  onEdit,
  onToggleStatus,
  onBack,
  onManageMembers,
  onManageModules,
  onRemoveMember,
  onRemoveModule,
}: PoolDetailProps) {
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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
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
          <p className="text-sm text-gray-500">Modulos</p>
          <p className="text-2xl font-semibold text-gray-900">{modules.length}</p>
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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar Miembro
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
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="mt-2">No hay miembros en este pool</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3"
                >
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
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modules Section */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Modulos Asignados</h3>
            <p className="text-sm text-gray-500">Modulos a los que tienen acceso los miembros de este pool</p>
          </div>
          <button
            type="button"
            onClick={onManageModules}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar Modulo
          </button>
        </div>
        <div className="p-4">
          {loadingModules ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <p className="mt-2">No hay modulos asignados a este pool</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {modules.map((poolModule) => (
                <div
                  key={poolModule.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {poolModule.module?.name || 'Modulo desconocido'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {poolModule.module?.code}
                        {poolModule.module?.description && ` - ${poolModule.module.description}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveModule(poolModule.moduleId)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Remover modulo"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PoolDetail;
