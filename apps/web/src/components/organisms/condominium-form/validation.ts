/**
 * Validation logic for condominium forms
 */

import type { CondominiumFormData, ValidationError, ValidationResult } from './types';

// Email pattern
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// NIT pattern (Colombian format: digits with optional dash and verification digit)
const NIT_PATTERN = /^[0-9]{9,10}(-[0-9])?$/;

// Phone pattern (allows various formats)
const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;

/**
 * Validates condominium name
 */
export function validateName(name: string): ValidationError | null {
  if (!name || name.trim() === '') {
    return { field: 'name', message: 'El nombre es requerido' };
  }
  if (name.length < 3) {
    return { field: 'name', message: 'El nombre debe tener al menos 3 caracteres' };
  }
  if (name.length > 100) {
    return { field: 'name', message: 'El nombre no puede tener mas de 100 caracteres' };
  }
  return null;
}

/**
 * Validates NIT format
 */
export function validateNit(nit?: string): ValidationError | null {
  if (nit && nit.trim() !== '') {
    if (!NIT_PATTERN.test(nit.replace(/\s/g, ''))) {
      return { field: 'nit', message: 'El NIT debe tener formato valido (ej: 900123456-1)' };
    }
  }
  return null;
}

/**
 * Validates address length
 */
export function validateAddress(address?: string): ValidationError | null {
  if (address && address.length > 200) {
    return { field: 'address', message: 'La direccion no puede tener mas de 200 caracteres' };
  }
  return null;
}

/**
 * Validates city length
 */
export function validateCity(city?: string): ValidationError | null {
  if (city && city.length > 50) {
    return { field: 'city', message: 'La ciudad no puede tener mas de 50 caracteres' };
  }
  return null;
}

/**
 * Validates phone format
 */
export function validatePhone(phone?: string): ValidationError | null {
  if (phone && phone.trim() !== '') {
    if (!PHONE_PATTERN.test(phone)) {
      return { field: 'phone', message: 'El telefono debe tener formato valido' };
    }
  }
  return null;
}

/**
 * Validates email format
 */
export function validateEmail(email?: string): ValidationError | null {
  if (email && email.trim() !== '') {
    if (!EMAIL_PATTERN.test(email)) {
      return { field: 'email', message: 'El correo electronico debe tener formato valido' };
    }
    if (email.length > 100) {
      return { field: 'email', message: 'El correo no puede tener mas de 100 caracteres' };
    }
  }
  return null;
}

/**
 * Validates the complete condominium form data
 */
export function validateCondominiumForm(data: CondominiumFormData): ValidationResult {
  const errors: ValidationError[] = [];

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const nitError = validateNit(data.nit);
  if (nitError) errors.push(nitError);

  const addressError = validateAddress(data.address);
  if (addressError) errors.push(addressError);

  const cityError = validateCity(data.city);
  if (cityError) errors.push(cityError);

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.push(phoneError);

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}
