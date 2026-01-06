/**
 * Database helpers for API testing
 *
 * Provides utilities for setting up and managing the test database.
 */
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';

// Load test environment variables from apps/api/.env.test
config({ path: path.resolve(process.cwd(), 'apps/api/.env.test') });

// Import entities
import { User } from '../../src/entities/user.entity';
import { RefreshToken } from '../../src/entities/refresh-token.entity';
import { AuthLog } from '../../src/entities/auth-log.entity';

/**
 * All entities used in the test database
 */
const entities = [User, RefreshToken, AuthLog];

/**
 * Create and initialize a test database connection
 */
export async function getTestDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'openbook_test',
    username: process.env.DATABASE_USER || 'openbook',
    password: process.env.DATABASE_PASSWORD || 'openbook_test_password',
    entities,
    synchronize: true, // Auto-create tables in test DB
    dropSchema: true, // Drop existing schema on each run
    logging: false,
  });

  await dataSource.initialize();
  return dataSource;
}

/**
 * Reset/clean the database between tests
 *
 * Truncates all tables while preserving the schema.
 * Uses CASCADE to handle foreign key constraints.
 */
export async function resetDatabase(dataSource: DataSource): Promise<void> {
  if (!dataSource.isInitialized) {
    return;
  }

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Disable foreign key checks
    await queryRunner.query('SET session_replication_role = replica;');

    // Get all table names
    const tables = dataSource.entityMetadatas
      .map((entity) => `"${entity.tableName}"`)
      .join(', ');

    if (tables) {
      // Truncate all tables
      await queryRunner.query(`TRUNCATE TABLE ${tables} CASCADE;`);
    }

    // Re-enable foreign key checks
    await queryRunner.query('SET session_replication_role = DEFAULT;');
  } finally {
    await queryRunner.release();
  }
}

/**
 * Close the test database connection
 */
export async function closeTestDatabase(dataSource: DataSource): Promise<void> {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
}

/**
 * Create a fresh data source for a specific test file
 * Useful when tests need isolated database instances
 */
export async function createIsolatedDataSource(): Promise<DataSource> {
  return getTestDataSource();
}
