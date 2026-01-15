import type { PoolFormData, ValidationResult, ValidationError } from './types';

export function validatePoolForm(data: PoolFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Name is required
  if (!data.name || data.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'El nombre es requerido',
    });
  } else if (data.name.trim().length < 3) {
    errors.push({
      field: 'name',
      message: 'El nombre debe tener al menos 3 caracteres',
    });
  } else if (data.name.trim().length > 100) {
    errors.push({
      field: 'name',
      message: 'El nombre no puede tener mas de 100 caracteres',
    });
  }

  // Description is optional but has max length
  if (data.description && data.description.trim().length > 500) {
    errors.push({
      field: 'description',
      message: 'La descripcion no puede tener mas de 500 caracteres',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
