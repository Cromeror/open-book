'use client';

import { SearchInput } from '@/components/molecules';

export interface CapudataRole {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  members?: { id: string; userId: string; addedAt?: string; user?: { id: string; name: string; email: string } }[];
  externalMembers?: { id: string; externalUserId: string; addedAt?: string; externalUser?: { id: string; externalId: string; name?: string | null; email?: string | null } }[];
  resourceAccess?: { id: string; resourceId: string; resource?: { id: string; code: string; name: string } }[];
}

export interface CapudataRoleListProps {
  roles: CapudataRole[];
  searchQuery?: string;
  loading?: boolean;
  selectedId?: string | null;
  onSearch: (query: string) => void;
  onCreate: () => void;
  onView: (role: CapudataRole) => void;
  onEdit: (role: CapudataRole) => void;
  onDelete: (role: CapudataRole) => void;
}

export function CapudataRoleList({
  roles,
  searchQuery = '',
  loading = false,
  selectedId,
  onSearch,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: CapudataRoleListProps) {
  const filteredRoles = searchQuery
    ? roles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          role.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : roles;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Roles Captudata</h2>
            <p className="text-sm text-gray-500">
              {roles.length} {roles.length === 1 ? 'rol registrado' : 'roles registrados'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Rol
          </button>
        </div>

        <div className="mt-4">
          <SearchInput
            placeholder="Buscar por nombre o descripcion..."
            initialValue={searchQuery}
            onSearch={onSearch}
            disabled={loading}
            size="sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripcion
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Miembros
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-32" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-48" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-12" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto" /></td>
                </tr>
              ))
            ) : filteredRoles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery
                    ? 'No se encontraron roles con ese criterio de busqueda'
                    : 'No hay roles registrados'}
                </td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
                <tr
                  key={role.id}
                  className={`hover:bg-gray-50 ${selectedId === role.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900">{role.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {role.description || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {role.members?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        role.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {role.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(role)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="Ver detalles"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(role)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600"
                        title="Editar"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(role)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                        title="Eliminar"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CapudataRoleList;
