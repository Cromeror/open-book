import type { ResponseFilter } from '../../types/resource-access.types';

/**
 * Apply a response filter to proxied data.
 *
 * Filters array items based on a field value whitelist (include) or blacklist (exclude).
 * Handles both direct arrays and paginated responses with a `data` property.
 *
 * @param data - The parsed JSON response from the external system
 * @param filter - The filter to apply
 * @returns Filtered data with the same structure
 */
export function applyResponseFilter(
  data: unknown,
  filter: ResponseFilter,
): unknown {
  if (data === null || data === undefined) return data;

  // Direct array
  if (Array.isArray(data)) {
    return filterArray(data, filter);
  }

  // Paginated object with `data` array
  if (typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return { ...obj, data: filterArray(obj.data, filter) };
    }
  }

  // Single object — check if it matches
  if (typeof data === 'object') {
    const value = getFieldValue(data as Record<string, unknown>, filter.field);
    const matches = filter.values.includes(String(value));
    if (filter.type === 'include' && !matches) return null;
    if (filter.type === 'exclude' && matches) return null;
  }

  return data;
}

function filterArray(
  items: unknown[],
  filter: ResponseFilter,
): unknown[] {
  return items.filter((item) => {
    if (typeof item !== 'object' || item === null) return true;

    const value = getFieldValue(item as Record<string, unknown>, filter.field);
    const stringValue = String(value);
    const matches = filter.values.includes(stringValue);

    return filter.type === 'include' ? matches : !matches;
  });
}

/**
 * Get a field value from an object, supporting dot notation.
 * e.g., `getFieldValue(obj, 'organization.code')` → `obj.organization.code`
 */
function getFieldValue(
  obj: Record<string, unknown>,
  field: string,
): unknown {
  const parts = field.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}
