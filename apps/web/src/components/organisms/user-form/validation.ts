import type { UserFormData, ValidationError } from './types';

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateUserForm(
  data: UserFormData,
  isEditMode: boolean
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'El nombre es requerido' });
  }

  if (!data.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'El apellido es requerido' });
  }

  if (!data.email.trim()) {
    errors.push({ field: 'email', message: 'El correo es requerido' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'El correo no es valido' });
  }

  if (!isEditMode && !data.password?.trim()) {
    errors.push({ field: 'password', message: 'La contrasena es requerida' });
  }

  if (data.password && data.password.length < 8) {
    errors.push({ field: 'password', message: 'La contrasena debe tener al menos 8 caracteres' });
  }

  return { isValid: errors.length === 0, errors };
}
