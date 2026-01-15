'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface SelectOption {
  id: string;
  label: string;
  description?: string;
}

export interface SelectModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Modal title */
  title: string;
  /** Modal subtitle/description */
  subtitle?: string;
  /** Label for the select field */
  selectLabel?: string;
  /** Placeholder text for the select */
  placeholder?: string;
  /** Available options to select from */
  options: SelectOption[];
  /** Text to show when no options are available */
  emptyMessage?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether the action is loading */
  loading?: boolean;
  /** Callback when an option is selected and confirmed */
  onConfirm: (selectedId: string) => void;
  /** Callback when cancelled or closed */
  onCancel: () => void;
}

/**
 * SelectModal - Reusable modal for selecting an item from a list
 */
export function SelectModal({
  isOpen,
  title,
  subtitle,
  selectLabel = 'Seleccionar',
  placeholder = 'Seleccione una opcion...',
  options,
  emptyMessage = 'No hay opciones disponibles',
  confirmText = 'Agregar',
  cancelText = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: SelectModalProps) {
  const [selectedId, setSelectedId] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedId('');
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
    if (selectedId) {
      onConfirm(selectedId);
    }
  }, [selectedId, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="select-modal-title"
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
                id="select-modal-title"
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
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectLabel}
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={loading || options.length === 0}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                  {option.description && ` - ${option.description}`}
                </option>
              ))}
            </select>
            {options.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedId || loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Agregando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectModal;
