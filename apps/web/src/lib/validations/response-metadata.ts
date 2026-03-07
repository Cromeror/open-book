/**
 * Converts ResponseMetadata (OpenAPI-like schema) into a flat list
 * of field descriptors for rendering detail/read-only views.
 */

import type { ResponseMetadata, PropertySchema } from '@/types/business';
import type { formatValue } from '@/lib/formatters';

export interface MetadataDetailField {
  /** Property key in the response object */
  field: string;
  /** Human-readable label */
  label: string;
  /** Format hint for formatValue() */
  format?: Parameters<typeof formatValue>[1];
}

/**
 * Map a PropertySchema type+format to a formatValue format hint.
 */
function resolveFormat(prop: PropertySchema): MetadataDetailField['format'] {
  if (prop.type === 'boolean') return 'boolean';

  if (prop.type === 'string') {
    if (prop.format === 'date' || prop.format === 'date-time') return 'date';
  }

  return undefined;
}

/**
 * Convert ResponseMetadata's success schema into a list of field descriptors
 * for rendering a detail view.
 */
export function responseMetadataToDetail(metadata: ResponseMetadata): MetadataDetailField[] {
  const properties = metadata.success?.schema?.properties;

  if (!properties) {
    return [];
  }

  const fields: MetadataDetailField[] = [];

  for (const [name, prop] of Object.entries(properties)) {
    // Skip nested objects/arrays — only render scalar fields
    if (prop.type === 'object' || prop.type === 'array') continue;

    fields.push({
      field: name,
      label: prop.description ?? name,
      format: resolveFormat(prop),
    });
  }

  return fields;
}
