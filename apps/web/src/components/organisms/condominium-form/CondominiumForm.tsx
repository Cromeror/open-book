'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CondominiumFormData, ValidationError } from './types';
import { validateCondominiumForm } from './validation';
import { Section } from '@/components/molecules';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-sm font-medium text-gray-700';

interface CondominiumFormProps {
  /** Initial data for edit mode */
  initialData?: CondominiumFormData;
  /** Whether the form is in edit mode */
  isEditMode?: boolean;
  /** Callback when form is submitted */
  onSubmit: (data: CondominiumFormData) => void;
  /** Callback when cancel is clicked */
  onCancel: () => void;
  /** Whether the form is loading */
  loading?: boolean;
}

/**
 * CondominiumForm - Shared form component for create/edit
 *
 * Used by both CondominiumCreateForm and CondominiumEditForm
 */
export function CondominiumForm({
  initialData,
  isEditMode = false,
  onSubmit,
  onCancel,
  loading = false,
}: CondominiumFormProps) {
  const [formData, setFormData] = useState<CondominiumFormData>(
    initialData || {
      name: '',
      nit: '',
      address: '',
      city: '',
      phone: '',
      email: '',
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
    (field: keyof CondominiumFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateCondominiumForm(formData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Clean up empty strings to undefined
      const cleanData: CondominiumFormData = {
        name: formData.name.trim(),
        nit: formData.nit?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
      };

      onSubmit(cleanData);
    },
    [formData, onSubmit]
  );

  const isFormValid = formData.name.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title='Información general'>
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
            placeholder="Ej: Conjunto Residencial Los Pinos"
            disabled={loading}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('name')}</p>
          )}
        </div>

        {/* NIT */}
        <div>
          <label htmlFor="nit" className={labelClasses}>
            NIT
          </label>
          <input
            id="nit"
            type="text"
            value={formData.nit || ''}
            onChange={(e) => handleFieldChange('nit', e.target.value)}
            className={`${inputClasses} ${getFieldError('nit') ? 'border-red-500' : ''}`}
            placeholder="Ej: 900123456-1"
            disabled={loading}
          />
          {getFieldError('nit') ? (
            <p className="mt-1 text-xs text-red-500">{getFieldError('nit')}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Numero de Identificacion Tributaria</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className={labelClasses}>
            Direccion
          </label>
          <input
            id="address"
            type="text"
            value={formData.address || ''}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            className={`${inputClasses} ${getFieldError('address') ? 'border-red-500' : ''}`}
            placeholder="Ej: Calle 123 # 45-67"
            disabled={loading}
          />
          {getFieldError('address') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('address')}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className={labelClasses}>
            Ciudad
          </label>
          <input
            id="city"
            type="text"
            value={formData.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className={`${inputClasses} ${getFieldError('city') ? 'border-red-500' : ''}`}
            placeholder="Ej: Bogota"
            disabled={loading}
          />
          {getFieldError('city') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('city')}</p>
          )}
        </div>
      </Section>

      <Section title='Información de contacto'>
        {/* Phone */}
        <div>
          <label htmlFor="phone" className={labelClasses}>
            Telefono
          </label>
          <input
            id="phone"
            type="text"
            value={formData.phone || ''}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            className={`${inputClasses} ${getFieldError('phone') ? 'border-red-500' : ''}`}
            placeholder="Ej: +57 300 123 4567"
            disabled={loading}
          />
          {getFieldError('phone') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('phone')}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClasses}>
            Correo Electronico
          </label>
          <input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={`${inputClasses} ${getFieldError('email') ? 'border-red-500' : ''}`}
            placeholder="Ej: administracion@conjuntolospinos.com"
            disabled={loading}
          />
          {getFieldError('email') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
          )}
        </div>

      </Section>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${isEditMode
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
              : 'Crear Condominio'}
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

export default CondominiumForm;
