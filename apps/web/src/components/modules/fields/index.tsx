'use client';

import type { FieldDefinition } from '@/lib/types/modules';
import type { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';

interface DynamicFieldProps {
  field: FieldDefinition;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
}

const inputClasses =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100';

const labelClasses = 'block text-sm font-medium text-gray-700';

/**
 * Dynamic field component that renders appropriate input based on field type
 */
export function DynamicField({
  field,
  register,
  errors,
  disabled = false,
}: DynamicFieldProps) {
  const error = errors[field.name];
  const errorMessage = error?.message as string | undefined;

  const baseProps = {
    id: field.name,
    disabled,
    placeholder: field.placeholder,
    ...register(field.name, {
      required: field.required ? `${field.label} es requerido` : false,
      min: field.min !== undefined ? { value: field.min, message: `Minimo: ${field.min}` } : undefined,
      max: field.max !== undefined ? { value: field.max, message: `Maximo: ${field.max}` } : undefined,
    }),
  };

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return <input type="text" className={inputClasses} {...baseProps} />;

      case 'number':
        return (
          <input
            type="number"
            min={field.min}
            max={field.max}
            className={inputClasses}
            {...baseProps}
          />
        );

      case 'money':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              step="1"
              min={0}
              className={`${inputClasses} pl-7`}
              {...baseProps}
            />
          </div>
        );

      case 'date':
        return <input type="date" className={inputClasses} {...baseProps} />;

      case 'textarea':
        return (
          <textarea rows={4} className={inputClasses} {...baseProps} />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...register(field.name)}
              disabled={disabled}
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </div>
        );

      case 'select':
        return (
          <select className={inputClasses} {...baseProps}>
            <option value="">Seleccione {field.label.toLowerCase()}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      default:
        return <input type="text" className={inputClasses} {...baseProps} />;
    }
  };

  // Boolean fields render differently
  if (field.type === 'boolean') {
    return (
      <div className="col-span-full">
        {renderInput()}
        {errorMessage && (
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={field.name} className={labelClasses}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
