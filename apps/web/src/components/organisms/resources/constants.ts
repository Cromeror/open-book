/**
 * Constants for HATEOAS resource configuration
 * Preset templates for common resource HTTP method patterns
 */

import { ResourceHttpMethod } from '@/types/business';

/**
 * HTTP method preset definition
 * These are UI helpers only - not stored in the database
 */
export interface HttpMethodPreset {
  id: string;
  label: string;
  description: string;
  httpMethods: ResourceHttpMethod[];
}

/**
 * Predefined HTTP method presets for common resource patterns
 *
 * - crud: Full CRUD operations (list, get, create, update, delete)
 * - readOnly: Read-only operations (list, get)
 * - custom: Start with empty methods for custom configuration
 */
export const HTTP_METHOD_PRESETS: Record<string, HttpMethodPreset> = {
  crud: {
    id: 'crud',
    label: 'CRUD Completo',
    description: 'Operaciones de Create, Read, Update, Delete',
    httpMethods: [
      { name: 'list', method: 'GET', urlPattern: '' },
      { name: 'get', method: 'GET', urlPattern: '/{id}' },
      { name: 'create', method: 'POST', urlPattern: '' },
      { name: 'update', method: 'PATCH', urlPattern: '/{id}' },
      { name: 'delete', method: 'DELETE', urlPattern: '/{id}' },
    ],
  },
  readOnly: {
    id: 'readOnly',
    label: 'Solo Lectura',
    description: 'Solo operaciones de consulta (sin modificaciones)',
    httpMethods: [
      { name: 'list', method: 'GET', urlPattern: '' },
      { name: 'get', method: 'GET', urlPattern: '/{id}' },
    ],
  },
  custom: {
    id: 'custom',
    label: 'Personalizado',
    description: 'Iniciar con una lista vacía',
    httpMethods: [],
  },
};

/**
 * Get all preset options for UI display
 */
export function getPresetOptions(): HttpMethodPreset[] {
  return Object.values(HTTP_METHOD_PRESETS);
}

/**
 * Get a specific preset by ID
 */
export function getPresetById(id: string): HttpMethodPreset | undefined {
  return HTTP_METHOD_PRESETS[id];
}

/**
 * Default HTTP method templates for common actions
 */
export const DEFAULT_HTTP_METHOD_TEMPLATES: Record<string, ResourceHttpMethod> = {
  list: { name: 'list', method: 'GET', urlPattern: '' },
  get: { name: 'get', method: 'GET', urlPattern: '/{id}' },
  create: { name: 'create', method: 'POST', urlPattern: '' },
  update: { name: 'update', method: 'PATCH', urlPattern: '/{id}' },
  delete: { name: 'delete', method: 'DELETE', urlPattern: '/{id}' },
};

/**
 * Get default HTTP method template by name
 */
export function getDefaultHttpMethod(name: string): ResourceHttpMethod | undefined {
  return DEFAULT_HTTP_METHOD_TEMPLATES[name];
}
