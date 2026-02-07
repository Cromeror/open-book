'use client';

/**
 * Session Context React Context
 *
 * Provides access to the user's session context throughout the app.
 * Data comes from server via props (gRPC call in server component).
 */

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { SessionContext } from '@/types/business';

const SessionContextContext = createContext<SessionContext | null>(null);

interface SessionContextProviderProps {
  children: ReactNode;
  initialContext: SessionContext | null;
}

/**
 * Provider component for session context
 * Receives data from server and provides it to client components
 */
export function SessionContextProvider({
  children,
  initialContext,
}: SessionContextProviderProps) {
  return (
    <SessionContextContext.Provider value={initialContext}>
      {children}
    </SessionContextContext.Provider>
  );
}

/**
 * Hook to access session context
 *
 * @throws Error if used outside SessionContextProvider
 */
export function useSessionContext(): SessionContext {
  const context = useContext(SessionContextContext);
  if (!context) {
    throw new Error('useSessionContext must be used within SessionContextProvider');
  }
  return context;
}
