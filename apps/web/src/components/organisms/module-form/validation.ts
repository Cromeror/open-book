/**
 * Validation logic for module forms
 * Shared between ModuleCreateForm and ModuleEditForm
 */

import type { ModuleFormData, ValidationError, ValidationResult } from './types';

// Code pattern: lowercase letters, numbers, and underscores only
const CODE_PATTERN = /^[a-z0-9_]+$/;

// Path pattern: starts with / and contains valid URL characters
const PATH_PATTERN = /^\/[a-z0-9\-_/]*$/i;

/**
 * Validates module code format
 */
export function validateCode(code: string): ValidationError | null {
  if (!code || code.trim() === '') {
    return { field: 'code', message: 'El codigo es requerido' };
  }
  if (code.length < 2) {
    return { field: 'code', message: 'El codigo debe tener al menos 2 caracteres' };
  }
  if (code.length > 50) {
    return { field: 'code', message: 'El codigo no puede tener mas de 50 caracteres' };
  }
  if (!CODE_PATTERN.test(code)) {
    return {
      field: 'code',
      message: 'El codigo solo puede contener letras minusculas, numeros y guion bajo',
    };
  }
  return null;
}

/**
 * Validates module name
 */
export function validateName(name: string): ValidationError | null {
  if (!name || name.trim() === '') {
    return { field: 'name', message: 'El nombre es requerido' };
  }
  if (name.length < 2) {
    return { field: 'name', message: 'El nombre debe tener al menos 2 caracteres' };
  }
  if (name.length > 100) {
    return { field: 'name', message: 'El nombre no puede tener mas de 100 caracteres' };
  }
  return null;
}

/**
 * Validates description length
 */
export function validateDescription(description?: string): ValidationError | null {
  if (description && description.length > 500) {
    return { field: 'description', message: 'La descripcion no puede tener mas de 500 caracteres' };
  }
  return null;
}

/**
 * Validates entity name for CRUD modules
 */
export function validateEntity(entity?: string, type?: string): ValidationError | null {
  if (type === 'crud' && entity && entity.length > 50) {
    return { field: 'entity', message: 'La entidad no puede tener mas de 50 caracteres' };
  }
  return null;
}

/**
 * Validates endpoint for CRUD modules
 */
export function validateEndpoint(endpoint?: string, type?: string): ValidationError | null {
  if (type === 'crud' && endpoint) {
    if (!endpoint.startsWith('/')) {
      return { field: 'endpoint', message: 'El endpoint debe comenzar con /' };
    }
    if (endpoint.length > 200) {
      return { field: 'endpoint', message: 'El endpoint no puede tener mas de 200 caracteres' };
    }
  }
  return null;
}

/**
 * Validates component name for specialized modules
 */
export function validateComponent(component?: string, type?: string): ValidationError | null {
  if (type === 'specialized' && component && component.length > 100) {
    return { field: 'component', message: 'El componente no puede tener mas de 100 caracteres' };
  }
  return null;
}

/**
 * Validates navigation path
 */
export function validateNavPath(path?: string): ValidationError | null {
  if (path) {
    if (!path.startsWith('/')) {
      return { field: 'navConfig.path', message: 'La ruta de navegacion debe comenzar con /' };
    }
    if (path.length > 200) {
      return {
        field: 'navConfig.path',
        message: 'La ruta de navegacion no puede tener mas de 200 caracteres',
      };
    }
    if (!PATH_PATTERN.test(path)) {
      return {
        field: 'navConfig.path',
        message: 'La ruta de navegacion contiene caracteres invalidos',
      };
    }
  }
  return null;
}

/**
 * Validates order number
 */
export function validateOrder(order?: number): ValidationError | null {
  if (order !== undefined && order < 0) {
    return { field: 'order', message: 'El orden no puede ser negativo' };
  }
  return null;
}

/**
 * Validates tags array
 */
export function validateTags(tags?: string[]): ValidationError | null {
  if (tags) {
    const invalidTag = tags.find((tag) => tag.length > 30);
    if (invalidTag) {
      return { field: 'tags', message: 'Cada tag no puede tener mas de 30 caracteres' };
    }
    if (tags.length > 10) {
      return { field: 'tags', message: 'No puede haber mas de 10 tags' };
    }
  }
  return null;
}

/**
 * Validates the complete module form data
 */
export function validateModuleForm(data: ModuleFormData): ValidationResult {
  const errors: ValidationError[] = [];

  // Required field validations
  const codeError = validateCode(data.code);
  if (codeError) errors.push(codeError);

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  // Optional field validations
  const descriptionError = validateDescription(data.description);
  if (descriptionError) errors.push(descriptionError);

  const entityError = validateEntity(data.entity, data.type);
  if (entityError) errors.push(entityError);

  const endpointError = validateEndpoint(data.endpoint, data.type);
  if (endpointError) errors.push(endpointError);

  const componentError = validateComponent(data.component, data.type);
  if (componentError) errors.push(componentError);

  const navPathError = validateNavPath(data.navConfig?.path);
  if (navPathError) errors.push(navPathError);

  const orderError = validateOrder(data.order);
  if (orderError) errors.push(orderError);

  const tagsError = validateTags(data.tags);
  if (tagsError) errors.push(tagsError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes module code to lowercase with only valid characters
 */
export function normalizeCode(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9_]/g, '');
}

/**
 * Normalizes tags array
 */
export function normalizeTags(tagsInput: string): string[] {
  return tagsInput
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
}
