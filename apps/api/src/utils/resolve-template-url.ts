/** Matches any `{...}` placeholder, e.g. `{id}` or `{session:condominiumId}` */
export const TEMPLATE_PLACEHOLDER_RE = /\{([^}]+)\}/g;

/** Matches only `{session:...}` placeholders */
export const SESSION_PLACEHOLDER_RE = /\{session:([^}]+)\}/g;

/** Matches any `{...}` placeholder (without global flag, safe for .test()) */
export const UNRESOLVED_PLACEHOLDER_RE = /\{[^}]+\}/;

/**
 * Replaces placeholders in a URL using a context object.
 * Dot-notation traverses nested objects (e.g. `{goal.id}` → `context.goal.id`).
 * Arrays are never resolved. Unresolved placeholders are kept as-is.
 *
 * By default replaces all `{key}` placeholders. Pass `SESSION_PLACEHOLDER_RE`
 * as the third argument to replace only `{session:key}` placeholders.
 *
 * @example
 * resolveTemplateUrl('/goals/{id}', { id: '123' })
 * // → '/goals/123'
 *
 * resolveTemplateUrl('/condominiums/{session:condominiumId}/goals', { condominiumId: '42' }, SESSION_PLACEHOLDER_RE)
 * // → '/condominiums/42/goals'
 */
export function resolveTemplateUrl(
  templateUrl: string,
  context: Record<string, unknown>,
  pattern: RegExp = TEMPLATE_PLACEHOLDER_RE,
): string {
  return templateUrl.replace(pattern, (placeholder, token: string) => {
    const value = getNestedValue(context, token);
    return value !== undefined && !Array.isArray(value) ? String(value) : placeholder;
  });
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (Array.isArray(current) || current === null || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, obj);
}
