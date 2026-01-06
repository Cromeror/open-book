import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { env } from './env';

/**
 * TypeORM configuration for NestJS
 * Uses forRootAsync pattern with environment variables
 */
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  poolSize: env.DATABASE_POOL_SIZE,

  // Entities are auto-loaded via TypeOrmModule.forFeature() in each module
  // Using empty array to avoid ESM/CommonJS glob pattern issues with Vitest
  entities: [],

  // Migrations are run via CLI with separate datasource config
  migrations: [],

  // Subscribers are registered via NestJS DI (see AuditSubscriber, ImmutableSubscriber)
  // Using empty array to avoid ESM/CommonJS glob pattern issues with Vitest
  subscribers: [],

  // Synchronize in test mode to auto-create tables
  synchronize: env.NODE_ENV === 'test',

  // Enable logging in development
  logging: env.NODE_ENV === 'development',

  // Auto-load entities from modules
  autoLoadEntities: true,

  // Connection retry settings - disable in test mode for faster failures
  retryAttempts: env.NODE_ENV === 'test' ? 1 : 10,
  retryDelay: env.NODE_ENV === 'test' ? 100 : 3000,
};

/**
 * Factory function for TypeOrmModule.forRootAsync
 */
export const typeOrmConfigFactory = (): TypeOrmModuleOptions => typeOrmConfig;
