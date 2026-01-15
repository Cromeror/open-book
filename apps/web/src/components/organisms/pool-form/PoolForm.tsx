'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PoolFormData, ValidationError } from './types';
import { validatePoolForm } from './validation';
import { Section } from '@/components/molecules';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-sm font-medium text-gray-700';

interface ModuleInfo {
  id: string;
  moduleId: string;
  module?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
}

interface AvailableModule {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface PoolFormProps {
  /** Initial data for edit mode */
  initialData?: PoolFormData;
  /** Whether the form is in edit mode */
  isEditMode?: boolean;
  /** Modules assigned to this pool (for edit mode) */
  assignedModules?: ModuleInfo[];
  /** All available modules in the system */
  availableModules?: AvailableModule[];
  /** Callback when form is submitted */
  onSubmit: (data: PoolFormData) => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Callback when a module is added */
  onAddModule?: (moduleId: string) => void;
  /** Callback when a module is removed */
  onRemoveModule?: (moduleId: string) => void;
  /** Whether the form is loading */
  loading?: boolean;
}

/**
 * PoolForm - Shared form component for create/edit
 */
export function PoolForm({
  initialData,
  isEditMode = false,
  assignedModules = [],
  availableModules = [],
  onSubmit,
  onCancel,
  onAddModule,
  onRemoveModule,
  loading = false,
}: PoolFormProps) {
  const [formData, setFormData] = useState<PoolFormData>(
    initialData || {
      name: '',
      description: '',
    }
  );

  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setErrors([]);
    }
  }, [initialData]);

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  const handleFieldChange = useCallback(
    (field: keyof PoolFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validatePoolForm(formData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Clean up data
      const cleanData: PoolFormData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      };

      onSubmit(cleanData);
    },
    [formData, onSubmit]
  );

  const isFormValid = formData.name.trim().length >= 3;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Informacion del Pool">
        {/* Name (required) */}
        <div>
          <label htmlFor="name" className={labelClasses}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className={`${inputClasses} ${getFieldError('name') ? 'border-red-500' : ''}`}
            placeholder="Ej: Administradores"
            disabled={loading}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('name')}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClasses}>
            Descripcion
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className={`${inputClasses} ${getFieldError('description') ? 'border-red-500' : ''}`}
            placeholder="Descripcion opcional del pool..."
            rows={3}
            disabled={loading}
          />
          {getFieldError('description') ? (
            <p className="mt-1 text-xs text-red-500">{getFieldError('description')}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              {(formData.description?.length || 0)}/500 caracteres
            </p>
          )}
        </div>
      </Section>

      {/* Modules Section - Only shown in edit mode */}
      {isEditMode && (
        <Section title="Modulos Asignados">
          {/* List of assigned modules */}
          {assignedModules.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No hay modulos asignados a este pool</p>
          ) : (
            <div className="space-y-2">
              {assignedModules.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-purple-500"
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.module?.name || 'Modulo desconocido'}
                      </p>
                      <p className="text-xs text-gray-500">{item.module?.code}</p>
                    </div>
                  </div>
                  {onRemoveModule && (
                    <button
                      type="button"
                      onClick={() => onRemoveModule(item.moduleId)}
                      disabled={loading}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Quitar modulo"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add module selector */}
          {onAddModule && availableModules.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className={labelClasses}>Agregar Modulo</label>
              <div className="mt-1 flex gap-2">
                <select
                  id="add-module-select"
                  className={`${inputClasses} flex-1`}
                  disabled={loading}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onAddModule(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Seleccionar modulo...</option>
                  {availableModules
                    .filter((mod) => !assignedModules.some((am) => am.moduleId === mod.id))
                    .map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.name} ({mod.code})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
            isEditMode
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          }`}
        >
          {loading
            ? isEditMode
              ? 'Guardando...'
              : 'Creando...'
            : isEditMode
              ? 'Guardar Cambios'
              : 'Crear Pool'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default PoolForm;
