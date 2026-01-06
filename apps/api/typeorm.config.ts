import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Load environment variables from .env file
dotenv.config({ path: __dirname + '/.env' });

/**
 * TypeORM CLI DataSource configuration
 * Used for migrations: generate, run, revert
 *
 * Usage:
 *   pnpm typeorm:generate --name=MigrationName
 *   pnpm typeorm:run
 *   pnpm typeorm:revert
 */
export default new DataSource({
  type: 'postgres',
  host: process.env['DATABASE_HOST'],
  port: parseInt(process.env['DATABASE_PORT'] || '5432', 10),
  username: process.env['DATABASE_USER'],
  password: process.env['DATABASE_PASSWORD'],
  database: process.env['DATABASE_NAME'],
  ssl:
    process.env['DATABASE_SSL'] === 'true'
      ? { rejectUnauthorized: false }
      : false,

  entities: [__dirname + '/src/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/*-*{.ts,.js}'],
  subscribers: [],

  synchronize: false,
  logging: process.env['NODE_ENV'] === 'development',
});
