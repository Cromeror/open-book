'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export type RelationType = 'OWNER' | 'TENANT' | 'OTHER';

export const RelationTypeLabels: Record<RelationType, string> = {
  OWNER: 'Propietario',
  TENANT: 'Arrendatario',
  OTHER: 'Otro',
};

export interface UserOption {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ResidentAssignmentData {
  userId: string;
  relationType: RelationType;
  isPrimary: boolean;
}

export interface ResidentAssignmentModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  users: UserOption[];
  loading?: boolean;
  onConfirm: (data: ResidentAssignmentData) => void;
  onCancel: () => void;
}

/**
 * ResidentAssignmentModal - Modal for assigning a user as resident/owner to a property
 */
export function ResidentAssignmentModal({
  isOpen,
  title,
  subtitle,
  users,
  loading = false,
  onConfirm,
  onCancel,
}: ResidentAssignmentModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('OWNER');
  const [isPrimary, setIsPrimary] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId('');
      setRelationType('OWNER');
      setIsPrimary(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !loading) {
        onCancel();
      }
    },
    [loading, onCancel]
  );

  // Focus trap
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const selectElement = dialogRef.current.querySelector('select') as HTMLSelectElement;
      selectElement?.focus();
    }
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    if (selectedUserId) {
      onConfirm({
        userId: selectedUserId,
        relationType,
        isPrimary,
      });
    }
  }, [selectedUserId, relationType, isPrimary, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="resident-assignment-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="relative w-full max-w-md rounded-lg bg-white shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div>
              <h3
                className="text-lg font-semibold text-gray-900"
                id="resident-assignment-modal-title"
              >
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* User Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loading || users.length === 0}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Seleccione un usuario...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">No hay usuarios disponibles</p>
              )}
            </div>

            {/* Relation Type Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relacion
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value as RelationType)}
                disabled={loading}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {Object.entries(RelationTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Is Primary Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                Contacto principal de la propiedad
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedUserId || loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResidentAssignmentModal;
