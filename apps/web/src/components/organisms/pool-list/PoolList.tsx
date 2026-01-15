'use client';

import { SearchInput } from '@/components/molecules';

// ============================================
// Types
// ============================================

export interface UserPool {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  members?: { id: string; userId: string; user?: { id: string; name: string; email: string } }[];
  modules?: { id: string; moduleId: string; module?: { id: string; name: string; code: string } }[];
  permissions?: { id: string }[];
}

export interface PoolListProps {
  /** List of pools to display */
  pools: UserPool[];
  /** Current search query */
  searchQuery?: string;
  /** Whether data is loading */
  loading?: boolean;
  /** Selected pool ID */
  selectedId?: string | null;
  /** Callback when search changes */
  onSearch: (query: string) => void;
  /** Callback when create button is clicked */
  onCreate: () => void;
  /** Callback when view action is clicked */
  onView: (pool: UserPool) => void;
  /** Callback when edit action is clicked */
  onEdit: (pool: UserPool) => void;
  /** Callback when delete action is clicked */
  onDelete: (pool: UserPool) => void;
}

// ============================================
// Component
// ============================================

/**
 * PoolList - Organism component
 *
 * Displays a list of user pools with:
 * - Search functionality
 * - Actions per row (view, edit, delete)
 * - Create button
 *
 * Does not make API calls - only receives data and emits events.
 */
export function PoolList({
  pools,
  searchQuery = '',
  loading = false,
  selectedId,
  onSearch,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: PoolListProps) {
  // Filter pools based on search query
  const filteredPools = searchQuery
    ? pools.filter(
        (pool) =>
          pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pool.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pools;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pools de Usuarios</h2>
            <p className="text-sm text-gray-500">
              {pools.length} {pools.length === 1 ? 'pool registrado' : 'pools registrados'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Crear Pool
          </button>
        </div>

        {/* Search */}
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
                Modulos
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
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredPools.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery
                    ? 'No se encontraron pools con ese criterio de busqueda'
                    : 'No hay pools registrados'}
                </td>
              </tr>
            ) : (
              filteredPools.map((pool) => (
                <tr
                  key={pool.id}
                  className={`hover:bg-gray-50 ${
                    selectedId === pool.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                      <p className="text-sm font-medium text-gray-900">{pool.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {pool.description || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {pool.members?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {pool.modules?.length ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        pool.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pool.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(pool)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        title="Ver detalles"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(pool)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600"
                        title="Editar"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(pool)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                        title="Eliminar"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
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

export default PoolList;
