'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface ModuleOption {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface PermissionOption {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface ModulePermissionsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Modal title */
  title: string;
  /** Modal subtitle/description */
  subtitle?: string;
  /** Available modules to select from */
  modules: ModuleOption[];
  /** Text to show when no modules are available */
  emptyModulesMessage?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether the action is loading */
  loading?: boolean;
  /** Callback to fetch permissions for a module */
  onFetchPermissions: (moduleCode: string) => Promise<PermissionOption[]>;
  /** Callback when module and permissions are confirmed */
  onConfirm: (moduleId: string, permissionIds: string[]) => void;
  /** Callback when cancelled or closed */
  onCancel: () => void;
}

/**
 * ModulePermissionsModal - Modal for selecting a module and its permissions
 *
 * Two-step flow:
 * 1. Select a module from the dropdown
 * 2. Select permissions (actions) to grant for that module
 */
export function ModulePermissionsModal({
  isOpen,
  title,
  subtitle,
  modules,
  emptyModulesMessage = 'No hay modulos disponibles',
  confirmText = 'Agregar',
  cancelText = 'Cancelar',
  loading = false,
  onFetchPermissions,
  onConfirm,
  onCancel,
}: ModulePermissionsModalProps) {
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [permissions, setPermissions] = useState<PermissionOption[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [step, setStep] = useState<'module' | 'permissions'>('module');
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedModuleId('');
      setPermissions([]);
      setSelectedPermissions(new Set());
      setStep('module');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading && !loadingPermissions) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, loadingPermissions, onCancel]);

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !loading && !loadingPermissions) {
        onCancel();
      }
    },
    [loading, loadingPermissions, onCancel]
  );

  // Focus trap
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const selectElement = dialogRef.current.querySelector('select') as HTMLSelectElement;
      selectElement?.focus();
    }
  }, [isOpen]);

  // Fetch permissions when module is selected
  const handleModuleSelect = useCallback(async (moduleId: string) => {
    setSelectedModuleId(moduleId);

    if (!moduleId) {
      setPermissions([]);
      return;
    }

    const selectedModule = modules.find(m => m.id === moduleId);
    if (!selectedModule) return;

    setLoadingPermissions(true);
    try {
      const fetchedPermissions = await onFetchPermissions(selectedModule.code);
      setPermissions(fetchedPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  }, [modules, onFetchPermissions]);

  // Handle moving to permissions step
  const handleNextStep = useCallback(() => {
    if (selectedModuleId && permissions.length > 0) {
      // Select all permissions by default
      setSelectedPermissions(new Set(permissions.map(p => p.id)));
      setStep('permissions');
    }
  }, [selectedModuleId, permissions]);

  // Handle going back to module selection
  const handleBackStep = useCallback(() => {
    setStep('module');
    setSelectedPermissions(new Set());
  }, []);

  // Toggle permission selection
  const handleTogglePermission = useCallback((permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  }, []);

  // Select/deselect all permissions
  const handleToggleAll = useCallback(() => {
    if (selectedPermissions.size === permissions.length) {
      setSelectedPermissions(new Set());
    } else {
      setSelectedPermissions(new Set(permissions.map(p => p.id)));
    }
  }, [permissions, selectedPermissions.size]);

  // Handle final confirm
  const handleConfirm = useCallback(() => {
    if (selectedModuleId && selectedPermissions.size > 0) {
      onConfirm(selectedModuleId, Array.from(selectedPermissions));
    }
  }, [selectedModuleId, selectedPermissions, onConfirm]);

  if (!isOpen) return null;

  const selectedModule = modules.find(m => m.id === selectedModuleId);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="module-permissions-modal-title"
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
          className="relative w-full max-w-lg rounded-lg bg-white shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div>
              <h3
                className="text-lg font-semibold text-gray-900"
                id="module-permissions-modal-title"
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
              disabled={loading || loadingPermissions}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Step 1: Module Selection */}
          {step === 'module' && (
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Modulo
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => handleModuleSelect(e.target.value)}
                disabled={loading || loadingPermissions || modules.length === 0}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Seleccione un modulo...</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name} ({module.code})
                  </option>
                ))}
              </select>

              {modules.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">{emptyModulesMessage}</p>
              )}

              {loadingPermissions && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cargando permisos...
                </div>
              )}

              {selectedModuleId && !loadingPermissions && permissions.length > 0 && (
                <div className="mt-4 rounded-md bg-blue-50 p-3">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">{permissions.length}</span> permisos disponibles para este modulo
                  </p>
                </div>
              )}

              {selectedModuleId && !loadingPermissions && permissions.length === 0 && (
                <div className="mt-4 rounded-md bg-amber-50 p-3">
                  <p className="text-sm text-amber-700">
                    Este modulo no tiene permisos configurados
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Content - Step 2: Permissions Selection */}
          {step === 'permissions' && (
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Permisos para: <span className="text-blue-600">{selectedModule?.name}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {selectedPermissions.size === permissions.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Seleccione los permisos que desea asignar al pool
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(permission.id)}
                      onChange={() => handleTogglePermission(permission.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {permission.name}
                        <span className="ml-2 text-xs text-gray-500 font-normal">
                          ({permission.code})
                        </span>
                      </p>
                      {permission.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-3 text-sm text-gray-500">
                {selectedPermissions.size} de {permissions.length} permisos seleccionados
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-2 border-t border-gray-200 p-4">
            {step === 'permissions' && (
              <button
                type="button"
                onClick={handleBackStep}
                disabled={loading}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Atras
              </button>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading || loadingPermissions}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {cancelText}
              </button>

              {step === 'module' && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedModuleId || loadingPermissions || permissions.length === 0}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Siguiente
                </button>
              )}

              {step === 'permissions' && (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={selectedPermissions.size === 0 || loading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Agregando...' : confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModulePermissionsModal;
