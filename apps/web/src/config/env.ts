import { z } from 'zod';

/**
 * Schema for public environment variables (exposed to browser)
 * These must have the NEXT_PUBLIC_ prefix
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default('OpenBook'),
});

/**
 * Schema for server-only environment variables
 * These are only available in Server Components and API routes
 */
const serverEnvSchema = z.object({
  API_SECRET_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validated public environment variables
 * Safe to use in client components
 */
export const publicEnv: PublicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

/**
 * Validated server environment variables
 * Only use in Server Components, API routes, or server actions
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() cannot be called on the client side');
  }

  return serverEnvSchema.parse({
    API_SECRET_KEY: process.env.API_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });
}
