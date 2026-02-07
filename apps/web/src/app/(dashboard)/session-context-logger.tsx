'use client';

import { useEffect } from 'react';
import type { SessionContext } from '@/types/business';

/**
 * Logs the session context to the browser console on mount.
 * Renders nothing visible.
 */
export function SessionContextLogger({ context }: { context: SessionContext | null }) {
  useEffect(() => {
    if (context) {
      console.log('[SessionContext]', context);
    } else {
      console.warn('[SessionContext] Not available');
    }
  }, [context]);

  return null;
}
