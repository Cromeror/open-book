import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Seed test users for development
 *
 * Creates two test users:
 * - admin@test.com (SuperAdmin) - Full system access
 * - user@test.com (Regular user) - No special permissions
 *
 * Password for both: Test123!
 *
 * NOTE: This migration should only run in development/test environments
 */
export class SeedTestUsers1736164000000 implements MigrationInterface {
  name = 'SeedTestUsers1736164000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash('Test123!', 12);

    // Create SuperAdmin user
    await queryRunner.query(
      `INSERT INTO users (
        id, email, password_hash, first_name, last_name,
        is_super_admin, is_active, public_account_consent,
        consent_ip_address, consent_user_agent, consent_date,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4,
        true, true, true,
        '127.0.0.1', 'Migration Seed', NOW(),
        NOW(), NOW()
      )
      ON CONFLICT (email) DO NOTHING`,
      ['admin@test.com', passwordHash, 'Admin', 'Test']
    );

    // Create regular user
    await queryRunner.query(
      `INSERT INTO users (
        id, email, password_hash, first_name, last_name,
        is_super_admin, is_active, public_account_consent,
        consent_ip_address, consent_user_agent, consent_date,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4,
        false, true, true,
        '127.0.0.1', 'Migration Seed', NOW(),
        NOW(), NOW()
      )
      ON CONFLICT (email) DO NOTHING`,
      ['user@test.com', passwordHash, 'Usuario', 'Prueba']
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM users WHERE email IN ('admin@test.com', 'user@test.com')`
    );
  }
}
