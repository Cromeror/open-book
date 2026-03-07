/**
 * Encode/decode HATEOAS link data for URL navigation.
 *
 * Encodes a HateoasLinkValue (href, method, resourceId) as a base64url
 * string to use as an opaque token in the URL, preventing users from
 * inferring API structure or resource IDs.
 */

import type { HateoasLinkValue } from '@/lib/types/modules';

interface LinkTokenPayload {
  /** API endpoint href */
  h: string;
  /** HTTP method (e.g. GET, POST, DELETE) */
  m: string;
  /** Resource ID (uuid of the resource definition) */
  r: string;
}

/** Encode a HATEOAS link value to a URL-safe base64 string */
export function encodeLinkToken(link: HateoasLinkValue): string {
  const payload: LinkTokenPayload = { h: link.href, m: link.method, r: link.resourceId };
  const json = JSON.stringify(payload);
  const base64 = btoa(json);
  // Make URL-safe: replace +/ with -_, remove trailing =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode a URL-safe base64 token back to a HATEOAS link value. Returns null on failure. */
export function decodeLinkToken(token: string): HateoasLinkValue | null {
  try {
    // Restore standard base64
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding
    while (base64.length % 4) base64 += '=';
    const json = atob(base64);
    const payload: LinkTokenPayload = JSON.parse(json);
    if (!payload.h || !payload.m || !payload.r) return null;
    return { href: payload.h, method: payload.m as HateoasLinkValue['method'], resourceId: payload.r };
  } catch {
    return null;
  }
}
