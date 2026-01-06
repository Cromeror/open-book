/* eslint-disable no-console -- Console output is intentional for env validation errors */
import { z } from 'zod';

/**
 * Schema for environment variables validation using Zod
 * This ensures all required variables are present and properly typed
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().positive().default(3000),

  // Database
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required'),
  DATABASE_PORT: z.coerce.number().positive().default(5432),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required'),
  DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
  DATABASE_URL: z.string().url().optional(),

  // JWT Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed configuration
 * Fails fast with clear error messages if required variables are missing
 */
export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );

    console.error('\n========================================');
    console.error('Environment validation failed!');
    console.error('========================================');
    console.error('Missing or invalid environment variables:\n');
    console.error(errors.join('\n'));
    console.error(
      '\nPlease check your .env file or environment configuration.'
    );
    console.error('See .env.example for required variables.\n');

    process.exit(1);
  }

  return result.data;
}

/**
 * Pre-validated environment configuration
 * Import this to access typed environment variables
 */
export const env = validateEnv();
