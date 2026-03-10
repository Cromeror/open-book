/**
 * Filter applied to GET responses to restrict which items a user/pool can see.
 *
 * The field references a property in the response items (extracted from responseMetadata).
 * - "include": only items where field matches one of the values are visible
 * - "exclude": items where field matches one of the values are hidden
 */
export interface ResponseFilter {
  /** Field path in the response item to filter on (e.g., "code", "id", "externalId") */
  field: string;
  /** Filter type: include = whitelist, exclude = blacklist */
  type: 'include' | 'exclude';
  /** Values to match against the field */
  values: string[];
}
