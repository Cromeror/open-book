'use client';

import { useState, useCallback, useEffect } from 'react';
import type { UserFormData, ValidationError } from './types';
import { validateUserForm } from './validation';
import { Section } from '@/components/molecules';

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100';
const labelClasses = 'block text-sm font-medium text-gray-700';

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  isEditMode?: boolean;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function UserForm({
  initialData,
  isEditMode = false,
  onSubmit,
  onCancel,
  loading = false,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    isSuperAdmin: false,
    isActive: true,
    ...initialData,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
      setErrors([]);
    }
  }, [initialData]);

  const getFieldError = useCallback(
    (field: string): string | undefined => errors.find((e) => e.field === field)?.message,
    [errors]
  );

  const handleFieldChange = useCallback(
    <K extends keyof UserFormData>(field: K, value: UserFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => prev.filter((e) => e.field !== field));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateUserForm(formData, isEditMode);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      const cleanData: UserFormData = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone?.trim() || undefined,
        isSuperAdmin: formData.isSuperAdmin,
        isActive: formData.isActive,
      };

      if (formData.password?.trim()) {
        cleanData.password = formData.password.trim();
      }

      onSubmit(cleanData);
    },
    [formData, isEditMode, onSubmit]
  );

  const isFormValid = formData.firstName.trim() !== '' && formData.lastName.trim() !== '' && formData.email.trim() !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Informacion personal">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* First name */}
          <div>
            <label htmlFor="firstName" className={labelClasses}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              className={`${inputClasses} ${getFieldError('firstName') ? 'border-red-500' : ''}`}
              placeholder="Ej: Juan"
              disabled={loading}
            />
            {getFieldError('firstName') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('firstName')}</p>
            )}
          </div>

          {/* Last name */}
          <div>
            <label htmlFor="lastName" className={labelClasses}>
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              className={`${inputClasses} ${getFieldError('lastName') ? 'border-red-500' : ''}`}
              placeholder="Ej: Perez"
              disabled={loading}
            />
            {getFieldError('lastName') && (
              <p className="mt-1 text-xs text-red-500">{getFieldError('lastName')}</p>
            )}
          </div>
        </div>

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
      </Section>

      <Section title="Acceso">
        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClasses}>
            Correo electronico <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={`${inputClasses} ${getFieldError('email') ? 'border-red-500' : ''}`}
            placeholder="Ej: juan.perez@correo.com"
            disabled={loading || isEditMode}
          />
          {getFieldError('email') ? (
            <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
          ) : isEditMode ? (
            <p className="mt-1 text-xs text-gray-500">El correo no puede ser modificado</p>
          ) : null}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className={labelClasses}>
            {isEditMode ? 'Nueva contrasena' : 'Contrasena'}{' '}
            {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <input
            id="password"
            type="password"
            value={formData.password || ''}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            className={`${inputClasses} ${getFieldError('password') ? 'border-red-500' : ''}`}
            placeholder={isEditMode ? 'Dejar vacio para no cambiar' : 'Minimo 8 caracteres'}
            disabled={loading}
          />
          {getFieldError('password') && (
            <p className="mt-1 text-xs text-red-500">{getFieldError('password')}</p>
          )}
        </div>
      </Section>

      <Section title="Configuracion">
        {/* isSuperAdmin */}
        <div className="flex items-center gap-3">
          <input
            id="isSuperAdmin"
            type="checkbox"
            checked={formData.isSuperAdmin ?? false}
            onChange={(e) => handleFieldChange('isSuperAdmin', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={loading}
          />
          <div>
            <label htmlFor="isSuperAdmin" className="text-sm font-medium text-gray-700">
              SuperAdmin
            </label>
            <p className="text-xs text-gray-500">El usuario tendra acceso total al sistema</p>
          </div>
        </div>

        {/* isActive */}
        {isEditMode && (
          <div className="flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive ?? true}
              onChange={(e) => handleFieldChange('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
            />
            <div>
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Activo
              </label>
              <p className="text-xs text-gray-500">El usuario puede iniciar sesion en el sistema</p>
            </div>
          </div>
        )}
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
            ? isEditMode ? 'Guardando...' : 'Creando...'
            : isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
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

export default UserForm;
