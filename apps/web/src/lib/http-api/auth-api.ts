'server only';

import { cache } from 'react';

import { publicEnv } from '@/config/env';
import type { AuthMeResponse } from '@/lib/types';

/**
 * Fetches the current user's auth data from the backend.
 * Cached per request via React cache() — multiple callers in the same render
 * share a single HTTP call.
 */
export const fetchAuthMe = cache(async (token: string): Promise<AuthMeResponse | null> => {
  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
});
