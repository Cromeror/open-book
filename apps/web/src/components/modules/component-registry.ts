/**
 * Registry of specialized module components (widgets).
 *
 * Each entry maps a widget name (stored in module.component in the DB)
 * to its React component AND its Zod props schema.
 *
 * The schema is used to:
 * - Validate componentConfig in the admin form before saving
 * - Provide type-safe props to the widget at render time
 *
 * To register a new widget:
 * 1. Create the component in `src/components/widgets/`
 * 2. Create its Zod schema in `src/components/widgets/<name>.schema.ts`
 * 3. Import both and add them to the `registry` map below
 *
 * See docs/WIDGETS.md for the full guide.
 */

import type { ComponentType } from 'react';
import type { ZodType } from 'zod';

import { MosaicWidget } from '@/components/widgets/MosaicWidget';
import { mosaicWidgetSchema } from '@/components/widgets/mosaic-widget.schema';

/** Props that every widget receives from GenericModule */
export interface WidgetProps {
  moduleCode: string;
  componentConfig: Record<string, unknown>;
}

export interface WidgetRegistryEntry {
  component: ComponentType<WidgetProps>;
  /** Zod schema that validates the componentConfig for this widget */
  schema: ZodType;
}

const registry: Record<string, WidgetRegistryEntry> = {
  MosaicWidget: {
    component: MosaicWidget as unknown as ComponentType<WidgetProps>,
    schema: mosaicWidgetSchema,
  },
};

/** List of all registered widget names (for admin forms). */
export const registeredComponentNames: string[] = Object.keys(registry);

/**
 * Resolve a widget name to its React component.
 * Returns undefined if the name is not registered.
 */
export function resolveModuleComponent(
  name: string | null | undefined,
): ComponentType<WidgetProps> | undefined {
  if (!name) return undefined;
  return registry[name]?.component;
}

/**
 * Resolve a widget name to its Zod schema.
 * Returns undefined if the name is not registered.
 */
export function resolveWidgetSchema(
  name: string | null | undefined,
): ZodType | undefined {
  if (!name) return undefined;
  return registry[name]?.schema;
}
