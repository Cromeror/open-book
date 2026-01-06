/**
 * API Test Setup
 *
 * This file is loaded before all API tests run.
 * Configure global test utilities, mocks, and database setup here.
 */
import { beforeAll, afterAll, afterEach } from 'vitest';
import { DataSource } from 'typeorm';
import { getTestDataSource, resetDatabase, closeTestDatabase } from './helpers/db';

let testDataSource: DataSource | null = null;

/**
 * Global setup - runs once before all tests
 */
beforeAll(async () => {
  // Only initialize if DATABASE_URL is set (for integration tests)
  if (process.env.DATABASE_URL || process.env.DATABASE_HOST) {
    try {
      testDataSource = await getTestDataSource();
      console.log('Test database connected');
    } catch (error) {
      console.warn('Test database not available, skipping DB setup:', error);
    }
  }
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
  if (testDataSource?.isInitialized) {
    await resetDatabase(testDataSource);
  }
});

/**
 * Global teardown - runs once after all tests
 */
afterAll(async () => {
  if (testDataSource) {
    await closeTestDatabase(testDataSource);
    console.log('Test database connection closed');
  }
});

/**
 * Export test data source for use in tests
 */
export { testDataSource };
