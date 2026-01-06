import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial migration that sets up PostgreSQL extensions and baseline configuration
 *
 * This migration:
 * - Enables uuid-ossp extension for UUID generation
 * - Sets timezone to America/Bogota for Colombian locale
 */
export class InitialSetup1736131200000 implements MigrationInterface {
  name = 'InitialSetup1736131200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension for generating UUIDs
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Set default timezone for the database
    await queryRunner.query(`SET timezone = 'America/Bogota'`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Note: We don't drop the uuid-ossp extension as other tables may depend on it
    // and it's generally safe to leave installed
  }
}
