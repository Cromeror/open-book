'use client';

import type { ManagersListProps, ManagerAvatarProps } from './types';

/**
 * Get initials from first and last name
 */
function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName.charAt(0).toUpperCase();
  return `${first}${last}`;
}

/**
 * Generate a consistent color based on name
 */
function getAvatarColor(firstName: string, lastName: string): string {
  const colors: readonly string[] = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  const hash = (firstName + lastName).split('').reduce((acc, char) => {
    return char.charCodeAt(0) + acc;
  }, 0);
  return colors[hash % colors.length] ?? 'bg-blue-500';
}

/**
 * ManagerAvatar - Displays initials in a colored circle
 */
function ManagerAvatar({ firstName, lastName, size = 'md' }: ManagerAvatarProps) {
  const initials = getInitials(firstName, lastName);
  const colorClass = getAvatarColor(firstName, lastName);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} flex items-center justify-center rounded-full text-white font-medium`}
    >
      {initials}
    </div>
  );
}

/**
 * ManagersList - Displays a list of managers with avatars and actions
 */
export function ManagersList({ managers, loading = false, onRemove, onAdd }: ManagersListProps) {
  if (loading) {
    return (
      <div className="py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Cargando administradores...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Administradores ({managers.length})
        </h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            Agregar
          </button>
        )}
      </div>

      {/* Empty state */}
      {managers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
          <p className="text-sm text-gray-500">No hay administradores asignados</p>
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Asignar primer administrador
            </button>
          )}
        </div>
      ) : (
        /* Managers list */
        <ul className="divide-y divide-gray-100">
          {managers.map((manager) => (
            <li
              key={manager.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <ManagerAvatar
                  firstName={manager.user.firstName}
                  lastName={manager.user.lastName}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {manager.user.firstName} {manager.user.lastName}
                    </p>
                    {manager.isPrimary && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{manager.user.email}</span>
                    {manager.user.phone && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>{manager.user.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(manager.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  title="Eliminar administrador"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ManagersList;
