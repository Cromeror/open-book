import type { PropertyFormData, ValidationResult, ValidationError } from './types';

export function validatePropertyForm(data: PropertyFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Identifier is required
  if (!data.identifier || data.identifier.trim() === '') {
    errors.push({
      field: 'identifier',
      message: 'El identificador es requerido',
    });
  } else if (data.identifier.length > 50) {
    errors.push({
      field: 'identifier',
      message: 'El identificador no puede tener mas de 50 caracteres',
    });
  }

  // CondominiumId is required
  if (!data.condominiumId) {
    errors.push({
      field: 'condominiumId',
      message: 'El condominio es requerido',
    });
  }

  // Area must be positive if provided
  if (data.area !== undefined && data.area !== null && data.area <= 0) {
    errors.push({
      field: 'area',
      message: 'El area debe ser un valor positivo',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
