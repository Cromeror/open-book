'use client';

import type { UserDetailProps } from './types';

function formatDate(value?: string): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function UserDetail({ user, loading = false, onEdit, onBack }: UserDetailProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Volver"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEdit(user)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
        </div>

        {/* Fields */}
        <dl className="divide-y divide-gray-100">
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-sm font-medium text-gray-500">Nombre</dt>
            <dd className="col-span-2 text-sm text-gray-900">{user.firstName}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-sm font-medium text-gray-500">Apellido</dt>
            <dd className="col-span-2 text-sm text-gray-900">{user.lastName}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-sm font-medium text-gray-500">Correo</dt>
            <dd className="col-span-2 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-sm font-medium text-gray-500">Telefono</dt>
            <dd className="col-span-2 text-sm text-gray-900">{user.phone || '-'}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-sm font-medium text-gray-500">Rol</dt>
            <dd className="col-span-2">
              {user.isSuperAdmin ? (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  SuperAdmin
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  Usuario
                </span>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="col-span-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-sm font-medium text-gray-500">Ultimo acceso</dt>
            <dd className="col-span-2 text-sm text-gray-900">{formatDate(user.lastLoginAt)}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-sm font-medium text-gray-500">Creado</dt>
            <dd className="col-span-2 text-sm text-gray-900">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default UserDetail;
