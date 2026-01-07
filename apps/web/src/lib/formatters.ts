/**
 * Value formatters for displaying data in lists and tables
 */

/**
 * Format a value based on the specified format type
 */
export function formatValue(
  value: unknown,
  format?: 'date' | 'money' | 'boolean'
): string {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (format) {
    case 'date':
      return formatDate(value);
    case 'money':
      return formatMoney(value);
    case 'boolean':
      return formatBoolean(value);
    default:
      return String(value);
  }
}

/**
 * Format a date value
 */
export function formatDate(value: unknown): string {
  if (!value) return '-';

  try {
    const date = new Date(value as string | number | Date);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(value);
  }
}

/**
 * Format a money value in COP (Colombian Pesos)
 */
export function formatMoney(value: unknown): string {
  if (value === null || value === undefined) return '-';

  const num = Number(value);
  if (isNaN(num)) return String(value);

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a boolean value
 */
export function formatBoolean(value: unknown): string {
  if (value === null || value === undefined) return '-';
  return value ? 'Si' : 'No';
}
