'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PoolFormData, ValidationError } from './types';
import { validatePoolForm } from './validation';
import { Section } from '@/components/molecules';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-sm font-medium text-gray-700';

interface PoolFormProps {
  /** Initial data for edit mode */
  initialData?: PoolFormData;
  /** Whether the form is in edit mode */
  isEditMode?: boolean;
  /** Callback when form is submitted */
  onSubmit: (data: PoolFormData) => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Whether the form is loading */
  loading?: boolean;
}

/**
 * PoolForm - Shared form component for create/edit
 */
export function PoolForm({
  initialData,
  isEditMode = false,
  onSubmit,
  onCancel,
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
