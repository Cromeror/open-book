/**
 * Capability Preset Types
 *
 * Predefined capability templates for quick HATEOAS resource configuration.
 * Pure business type - no ORM decorators, no transport concerns.
 */

import type { HttpMethod, ResourceHttpMethod } from './resource.types';

/**
 * A capability within a preset
 * Simplified version of ResourceHttpMethod for preset definitions
 */
export interface PresetCapability {
  /** Display name for the capability (e.g., "List", "Create", "Update") */
  name: string;
  /** HTTP method for this capability */
  method: HttpMethod;
  /** URL pattern template (e.g., "", "/{id}", "/{id}/activate") */
  urlPattern: string;
}

/**
 * Capability preset configuration
 * Groups related capabilities that are commonly used together
 */
export interface CapabilityPreset {
  /** Unique identifier (e.g., 'crud', 'readOnly') */
  id: string;
  /** Display label (e.g., 'CRUD Completo', 'Solo Lectura') */
  label: string;
  /** Description of what this preset provides */
  description: string;
  /** List of capabilities in this preset */
  capabilities: PresetCapability[];
  /** Whether this is a system-defined preset (cannot be modified) */
  isSystem: boolean;
  /** Display order for sorting presets */
  order: number;
}

/**
 * Convert preset capabilities to resource HTTP methods
 */
export function presetToResourceHttpMethods(
  preset: CapabilityPreset,
): ResourceHttpMethod[] {
  return preset.capabilities.map((cap) => ({
    name: cap.name,
    method: cap.method,
    urlPattern: cap.urlPattern,
  }));
}
