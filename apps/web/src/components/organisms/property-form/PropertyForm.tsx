'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PropertyFormData, ValidationError } from './types';
import { validatePropertyForm } from './validation';
import { Section } from '@/components/molecules';
import { PropertyType, PropertyTypeLabels } from '../PropertyList';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-sm font-medium text-gray-700';

interface PropertyFormProps {
  /** Initial data for edit mode */
  initialData?: PropertyFormData;
  /** Whether the form is in edit mode */
  isEditMode?: boolean;
  /** Condominium ID (required for create) */
  condominiumId: string;
  /** Callback when form is submitted */
  onSubmit: (data: PropertyFormData) => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Whether the form is loading */
  loading?: boolean;
}

/**
 * PropertyForm - Shared form component for create/edit
 */
export function PropertyForm({
  initialData,
  isEditMode = false,
  condominiumId,
  onSubmit,
  onCancel,
  loading = false,
}: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>(
    initialData || {
      identifier: '',
      type: PropertyType.APARTMENT,
      description: '',
      floor: undefined,
      area: undefined,
      condominiumId,
      groupId: null,
      displayOrder: 0,
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
    (field: keyof PropertyFormData, value: string | number | undefined | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const dataToValidate = {
        ...formData,
        condominiumId,
      };

      const validation = validatePropertyForm(dataToValidate);

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Clean up data
      const cleanData: PropertyFormData = {
        identifier: formData.identifier.trim(),
        type: formData.type,
        description: formData.description?.trim() || undefined,
        floor: formData.floor || undefined,
        area: formData.area || undefined,
        condominiumId,
        groupId: formData.groupId || null,
        displayOrder: formData.displayOrder ?? 0,
      };

      onSubmit(cleanData);
    },
    [formData, condominiumId, onSubmit]
  );

  const isFormValid = formData.identifier.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Informacion basica">
        {/* Identifier (required) */}
        <div>
          <label htmlFor="identifier" className={labelClasses}>
            Identificador <span className="text-red-500">*</span>
          </label>
          <input
            id="identifier"
            type="text"
            value={formData.identifier}
            onChange={(e) => handleFieldChange('identifier', e.target.value)}
            className={`${inputClasses} ${getFieldError('identifier') ? 'border-red-500' : ''}`}
            placeholder="Ej: 101, P-001, Local 5"
            disabled={loading}
          />
          {getFieldError('identifier') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('identifier')}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className={labelClasses}>
            Tipo
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleFieldChange('type', e.target.value as PropertyType)}
            className={inputClasses}
            disabled={loading}
          >
            {Object.entries(PropertyTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
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
            className={inputClasses}
            placeholder="Descripcion opcional de la propiedad"
            rows={2}
            disabled={loading}
          />
        </div>
      </Section>

      <Section title="Caracteristicas">
        <div className="grid grid-cols-2 gap-4">
          {/* Floor */}
          <div>
            <label htmlFor="floor" className={labelClasses}>
              Piso
            </label>
            <input
              id="floor"
              type="number"
              value={formData.floor ?? ''}
              onChange={(e) =>
                handleFieldChange('floor', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className={inputClasses}
              placeholder="Ej: 1, 2, -1"
              disabled={loading}
            />
          </div>

          {/* Area */}
          <div>
            <label htmlFor="area" className={labelClasses}>
              Area (m2)
            </label>
            <input
              id="area"
              type="number"
              step="0.01"
              value={formData.area ?? ''}
              onChange={(e) =>
                handleFieldChange('area', e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className={`${inputClasses} ${getFieldError('area') ? 'border-red-500' : ''}`}
              placeholder="Ej: 50.5"
              disabled={loading}
            />
            {getFieldError('area') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('area')}</p>
            )}
          </div>
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
              : 'Crear Propiedad'}
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

export default PropertyForm;
