import type { UrlSegment } from './url-segment.types';
import { PARAMETER_KEYS } from './url-segment.types';
import type { HttpMethod, ResourceHttpMethod, ResourceScope } from '@/types/business';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_REGEX = /^\d+$/;
const MIXED_ID_REGEX = /^[a-z0-9]+-[a-z0-9-]+$/i;

/**
 * Detect if a segment looks like a dynamic value (UUID, numeric, or ID-like)
 */
export function isLikelyDynamicSegment(value: string): boolean {
  if (UUID_REGEX.test(value)) return true;
  if (NUMERIC_REGEX.test(value)) return true;
  // Mixed alphanumeric with hyphens that contain digits (e.g., 'abc-123')
  if (MIXED_ID_REGEX.test(value) && /\d/.test(value)) return true;
  return false;
}

/**
 * Try to guess a parameter key based on the preceding static segment.
 * E.g., if the segment before a dynamic one is "condominiums", suggest "condominiumId".
 */
function guessParameterKey(precedingSegment: string | null): string | null {
  if (!precedingSegment) return null;

  // Map plural resource names to their ID parameter key
  const mapping: Record<string, string> = {
    condominiums: 'condominiumId',
    goals: 'goalId',
    properties: 'propertyId',
    users: 'userId',
    apartments: 'apartmentId',
    activities: 'activityId',
    commitments: 'commitmentId',
    contributions: 'contributionId',
    reports: 'reportId',
    pqr: 'pqrId',
  };

  const key = mapping[precedingSegment.toLowerCase()];
  if (key && PARAMETER_KEYS.includes(key as (typeof PARAMETER_KEYS)[number])) {
    return key;
  }
  return null;
}

/**
 * Split a raw URL into editable segments (excludes leading empty and 'api')
 */
export function parseUrlIntoSegments(rawUrl: string): UrlSegment[] {
  const parts = rawUrl.split('/').filter(Boolean);

  // Skip the 'api' prefix — it's always static
  const startIndex = parts[0] === 'api' ? 1 : 0;
  const editableParts = parts.slice(startIndex);

  return editableParts.map((part, i) => {
    const isDynamic = isLikelyDynamicSegment(part);
    const precedingSegment: string | null = i > 0 ? editableParts[i - 1] ?? null : null;

    return {
      originalValue: part,
      index: i,
      isDynamic,
      parameterKey: isDynamic ? guessParameterKey(precedingSegment) : null,
    };
  });
}

/**
 * Reconstruct a template URL from configured segments
 */
export function buildTemplateUrl(segments: UrlSegment[]): string {
  const parts = segments.map((seg) => {
    if (seg.isDynamic && seg.parameterKey) {
      return `{${seg.parameterKey}}`;
    }
    return seg.originalValue;
  });

  return '/api/' + parts.join('/');
}

/**
 * Derive a resource code suggestion from the last static segment
 */
export function deriveResourceCode(segments: UrlSegment[]): string {
  const staticSegments = segments.filter((s) => !s.isDynamic);
  const lastStatic = staticSegments[staticSegments.length - 1];
  if (!lastStatic) return '';
  return lastStatic.originalValue.toLowerCase();
}

/**
 * Detect scope from segments (contains 'condominiums' → 'condominium', else 'global')
 */
export function detectScope(segments: UrlSegment[]): ResourceScope {
  const hasCondominium = segments.some(
    (s) => !s.isDynamic && s.originalValue.toLowerCase() === 'condominiums',
  );
  return hasCondominium ? 'condominium' : 'global';
}

/**
 * Recursively collect property keys from a schema using dot notation.
 * Objects produce "parent.child". Arrays are skipped.
 */
function collectPropertyKeys(
  properties: Record<string, unknown>,
  prefix: string,
  keys: Set<string>,
): void {
  for (const [key, schema] of Object.entries(properties)) {
    if (!schema || typeof schema !== 'object') continue;
    const s = schema as Record<string, unknown>;
    if (s.type === 'array') continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.add(fullKey);

    if (s.type === 'object' && s.properties && typeof s.properties === 'object') {
      collectPropertyKeys(s.properties as Record<string, unknown>, fullKey, keys);
    }
  }
}

/**
 * Extract property keys from responseMetadata JSON strings of enabled methods.
 * Traverses nested objects/arrays using dot notation (e.g., 'condominium.id', 'activities[].id').
 * Returns a deduplicated sorted array.
 */
export function extractResponsePropertyKeys(
  configs: { enabled: boolean; responseMetadata?: string }[],
): string[] {
  const keys = new Set<string>();

  for (const config of configs) {
    if (!config.enabled || !config.responseMetadata?.trim()) continue;

    try {
      const parsed = JSON.parse(config.responseMetadata);
      const properties = parsed?.success?.schema?.properties;
      if (properties && typeof properties === 'object') {
        collectPropertyKeys(properties as Record<string, unknown>, '', keys);
      }
    } catch {
      // invalid JSON, skip
    }
  }

  return Array.from(keys).sort();
}

export interface MethodConfigInput {
  method: HttpMethod;
  enabled: boolean;
  payloadMetadata?: string;
  responseMetadata?: string;
}

/**
 * Generate default resource HTTP methods from method configurations
 */
export function generateDefaultHttpMethods(configs: MethodConfigInput[]): ResourceHttpMethod[] {
  const httpMethods: ResourceHttpMethod[] = [];

  for (const config of configs) {
    if (!config.enabled) continue;

    const base = {
      payloadMetadata: config.payloadMetadata || undefined,
      responseMetadata: config.responseMetadata || undefined,
    };

    switch (config.method) {
      case 'GET':
        httpMethods.push({ name: 'list', method: 'GET', urlPattern: '', ...base });
        httpMethods.push({ name: 'get', method: 'GET', urlPattern: '/{id}', ...base });
        break;
      case 'POST':
        httpMethods.push({ name: 'create', method: 'POST', urlPattern: '', ...base });
        break;
      case 'PATCH':
        httpMethods.push({ name: 'update', method: 'PATCH', urlPattern: '/{id}', ...base });
        break;
      case 'DELETE':
        httpMethods.push({ name: 'delete', method: 'DELETE', urlPattern: '/{id}', ...base });
        break;
      case 'PUT':
        httpMethods.push({ name: 'replace', method: 'PUT', urlPattern: '/{id}', ...base });
        break;
    }
  }

  return httpMethods;
}

const ALL_METHODS: HttpMethod[] = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'];

/**
 * Convert ResourceHttpMethod[] (from backend) to MethodConfig[] (for StepMethodConfig UI).
 *
 * Methods that exist in the resource -> enabled: true with their metadata.
 * Methods that don't exist -> enabled: false, empty metadata.
 */
export function resourceHttpMethodsToMethodConfigs(
  httpMethods: ResourceHttpMethod[],
): MethodConfigInput[] {
  const byMethod = new Map<HttpMethod, ResourceHttpMethod>();
  for (const hm of httpMethods) {
    if (!byMethod.has(hm.method)) {
      byMethod.set(hm.method, hm);
    }
  }

  return ALL_METHODS.map((method) => {
    const existing = byMethod.get(method);
    if (existing) {
      return {
        method,
        enabled: true,
        payloadMetadata: existing.payloadMetadata ?? '',
        responseMetadata: existing.responseMetadata ?? '',
      };
    }
    return {
      method,
      enabled: false,
      payloadMetadata: '',
      responseMetadata: '',
    };
  });
}

/**
 * Convert MethodConfig[] (from StepMethodConfig UI) to ResourceHttpMethod[]
 * for submission via ResourceFormData.
 *
 * Only enabled methods are included.
 */
export function methodConfigsToSubmitHttpMethods(
  configs: MethodConfigInput[],
): ResourceHttpMethod[] {
  return configs
    .filter((c) => c.enabled)
    .map((c) => ({
      name: c.method.toLowerCase(),
      method: c.method,
      urlPattern: '',
      payloadMetadata: c.payloadMetadata || undefined,
      responseMetadata: c.responseMetadata || undefined,
    }));
}
