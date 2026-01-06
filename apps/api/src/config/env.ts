/* eslint-disable no-console -- Console output is intentional for env validation errors */
import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load test environment variables if running in test mode
if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
  config({ path: path.resolve(process.cwd(), 'apps/api/.env.test') });
}

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
  DATABASE_URL: z.string().optional(),
  DATABASE_POOL_SIZE: z.coerce.number().positive().default(10),
  DATABASE_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),

  // JWT Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
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
 *
 * Note: In test environment, validation errors don't exit the process
 * to allow test setup to complete first.
 */
function getEnv(): EnvConfig {
  // Skip strict validation in test mode if env vars are not yet loaded
  if (process.env.NODE_ENV === 'test') {
    const result = envSchema.safeParse(process.env);
    if (result.success) {
      return result.data;
    }
    // Return defaults for test environment
    return {
      NODE_ENV: 'test',
      PORT: 3000,
      DATABASE_HOST: process.env.DATABASE_HOST || 'localhost',
      DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '5433', 10),
      DATABASE_NAME: process.env.DATABASE_NAME || 'openbook_test',
      DATABASE_USER: process.env.DATABASE_USER || 'postgres',
      DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'postgres',
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_POOL_SIZE: 5,
      DATABASE_SSL: false,
      JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-key-that-is-at-least-32-characters-long',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
  }
  return validateEnv();
}

export const env = getEnv();

/**
 * Get the database connection URL
 * Uses DATABASE_URL if provided, otherwise constructs from individual parts
 */
export function getDatabaseUrl(): string {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  return `postgresql://${env.DATABASE_USER}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME}`;
}

/**
 * Database configuration object for TypeORM or other ORMs
 */
export const databaseConfig = {
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  database: env.DATABASE_NAME,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  url: getDatabaseUrl(),
  poolSize: env.DATABASE_POOL_SIZE,
  ssl: env.DATABASE_SSL,
};

/**
 * Convert duration string (e.g., '15m', '7d') to seconds
 */
function parseExpirationToSeconds(expiresIn: string): number {
  const value = parseInt(expiresIn.slice(0, -1), 10);
  const unit = expiresIn.slice(-1);

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 15 * 60; // Default 15 minutes
  }
}

/**
 * JWT configuration object
 */
export const jwtConfig = {
  secret: env.JWT_SECRET,
  accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
  accessExpiresInSeconds: parseExpirationToSeconds(env.JWT_ACCESS_EXPIRES_IN),
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  refreshExpiresInSeconds: parseExpirationToSeconds(env.JWT_REFRESH_EXPIRES_IN),
};
