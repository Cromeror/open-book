/**
 * Helper functions for gRPC client usage in Server Components
 */

import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Get JWT token from cookies
 * Redirects to login if token not found
 *
 * Use this in Server Components when you need the token for gRPC calls
 *
 * @example
 * ```tsx
 * export default async function Page() {
 *   const token = await getAuthToken();
 *   const client = getCondominiumsGrpcClient();
 *   const data = await client.getUserCondominiums(token);
 *   // ...
 * }
 * ```
 */
export async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  return token;
}

/**
 * Get JWT token from cookies (optional)
 * Returns null if token not found (doesn't redirect)
 *
 * Use this when you want to handle missing token yourself
 *
 * @example
 * ```tsx
 * export default async function Page() {
 *   const token = await getAuthTokenOrNull();
 *   if (!token) {
 *     return <LoginPrompt />;
 *   }
 *   // ...
 * }
 * ```
 */
export async function getAuthTokenOrNull(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value || null;
}
