'server only';

import { cache } from 'react';
import { cookies } from 'next/headers';

import { publicEnv } from '@/config/env';
import type { ResourcePublic } from '@/types/business';

export const fetchResourceById = cache(async (id: string): Promise<ResourcePublic | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/resources/${id}`, {
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
