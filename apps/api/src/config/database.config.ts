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

  // Entity configuration
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],

  // Migration configuration
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],

  // Subscribers for audit logging
  subscribers: [__dirname + '/../subscribers/**/*{.ts,.js}'],

  // IMPORTANT: Always false in production - use migrations only
  synchronize: false,

  // Enable logging in development
  logging: env.NODE_ENV === 'development',

  // Auto-load entities from modules
  autoLoadEntities: true,
};

/**
 * Factory function for TypeOrmModule.forRootAsync
 */
export const typeOrmConfigFactory = (): TypeOrmModuleOptions => typeOrmConfig;
