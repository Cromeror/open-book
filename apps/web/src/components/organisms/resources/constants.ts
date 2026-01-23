/**
 * Constants for HATEOAS resource configuration
 * Preset capability templates for common resource patterns
 */

import { ResourceCapability } from '@/types/resources';

/**
 * Capability preset definition
 * These are UI helpers only - not stored in the database
 */
export interface CapabilityPreset {
  id: string;
  label: string;
  description: string;
  capabilities: ResourceCapability[];
}

/**
 * Predefined capability presets for common resource patterns
 *
 * - crud: Full CRUD operations (list, get, create, update, delete)
 * - readOnly: Read-only operations (list, get)
 * - custom: Start with empty capabilities for custom configuration
 */
export const CAPABILITY_PRESETS: Record<string, CapabilityPreset> = {
  crud: {
    id: 'crud',
    label: 'CRUD Completo',
    description: 'Operaciones de Create, Read, Update, Delete',
    capabilities: [
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
    capabilities: [
      { name: 'list', method: 'GET', urlPattern: '' },
      { name: 'get', method: 'GET', urlPattern: '/{id}' },
    ],
  },
  custom: {
    id: 'custom',
    label: 'Personalizado',
    description: 'Iniciar con una lista vacía de capacidades',
    capabilities: [],
  },
};

/**
 * Get all preset options for UI display
 */
export function getPresetOptions(): CapabilityPreset[] {
  return Object.values(CAPABILITY_PRESETS);
}

/**
 * Get a specific preset by ID
 */
export function getPresetById(id: string): CapabilityPreset | undefined {
  return CAPABILITY_PRESETS[id];
}

/**
 * Default capability templates for common actions
 */
export const DEFAULT_CAPABILITY_TEMPLATES: Record<string, ResourceCapability> = {
  list: { name: 'list', method: 'GET', urlPattern: '' },
  get: { name: 'get', method: 'GET', urlPattern: '/{id}' },
  create: { name: 'create', method: 'POST', urlPattern: '' },
  update: { name: 'update', method: 'PATCH', urlPattern: '/{id}' },
  delete: { name: 'delete', method: 'DELETE', urlPattern: '/{id}' },
};

/**
 * Get default capability template by name
 */
export function getDefaultCapability(name: string): ResourceCapability | undefined {
  return DEFAULT_CAPABILITY_TEMPLATES[name];
}
