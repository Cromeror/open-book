'use client';

import { useMemo } from 'react';
import { SearchInput } from '@/components/molecules';

// ============================================
// Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  publicAccountConsent: boolean;
  consentDate?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListProps {
  users: User[];
  pagination: UserPaginationInfo;
  searchQuery?: string;
  loading?: boolean;
  selectedId?: string | null;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

// ============================================
// Component
// ============================================

/**
 * UserList - Organism component
 *
 * Displays a list of users with:
 * - Search functionality
 * - Pagination
 * - Actions per row (view, edit, delete)
 * - Create button
 *
 * Does not make API calls - only receives data and emits events.
 */
export function UserList({
  users,
  pagination,
  searchQuery = '',
  loading = false,
  selectedId,
  onSearch,
  onPageChange,
  onCreate,
  onView,
  onEdit,
  onDelete,
}: UserListProps) {
  const pageNumbers = useMemo(() => {
    const { page, totalPages } = pagination;
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 3) end = 4;
      if (page >= totalPages - 2) start = totalPages - 3;

      if (start > 2) pages.push(-1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push(-2);

      pages.push(totalPages);
    }

    return pages;
  }, [pagination]);

  const { page, total, totalPages, limit } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Usuarios</h2>
            <p className="text-sm text-gray-500">
              {total} {total === 1 ? 'usuario registrado' : 'usuarios registrados'}
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
            Crear Usuario
          </button>
        </div>

        <div className="mt-4">
          <SearchInput
            placeholder="Buscar por nombre o correo..."
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
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
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
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery
                    ? 'No se encontraron usuarios con ese criterio de busqueda'
                    : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 ${selectedId === user.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.isSuperAdmin ? (
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        SuperAdmin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        Usuario
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(user)}
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
                        onClick={() => onEdit(user)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600"
                        title="Editar"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {startItem} - {endItem} de {total}
          </div>
          <nav className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || loading}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Pagina anterior"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {pageNumbers.map((pageNum, idx) =>
              pageNum < 0 ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium ${
                    page === pageNum ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  {pageNum}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Pagina siguiente"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default UserList;
