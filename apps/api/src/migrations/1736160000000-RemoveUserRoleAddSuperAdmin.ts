import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

/**
 * Migration to remove role system and add SuperAdmin flag
 *
 * Changes:
 * - Removes 'role' column from users table
 * - Removes 'user_role_enum' PostgreSQL type
 * - Adds 'is_super_admin' boolean column
 *
 * This migration supports the new module-based permission system
 * where permissions are granted per-module instead of using roles.
 */
export class RemoveUserRoleAddSuperAdmin1736160000000 implements MigrationInterface {
  name = 'RemoveUserRoleAddSuperAdmin1736160000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add is_super_admin column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'is_super_admin',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );

    // 2. Optional: Migrate existing ADMIN users to SuperAdmin
    // Only uncomment if you want to automatically promote existing ADMINs
    // IMPORTANT: Only ONE user should be SuperAdmin, verify manually
    // await queryRunner.query(`
    //   UPDATE users
    //   SET is_super_admin = true
    //   WHERE role = 'ADMIN'
    //   AND id = (SELECT id FROM users WHERE role = 'ADMIN' ORDER BY created_at ASC LIMIT 1)
    // `);

    // 3. Drop the role index
    await queryRunner.dropIndex('users', 'idx_users_role');

    // 4. Drop the role column
    await queryRunner.dropColumn('users', 'role');

    // 5. Drop the enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);

    // 6. Create index on is_super_admin for quick lookups
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_is_super_admin',
        columnNames: ['is_super_admin'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop is_super_admin index
    await queryRunner.dropIndex('users', 'idx_users_is_super_admin');

    // 2. Recreate enum type
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'RESIDENT')
    `);

    // 3. Add role column back
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'user_role_enum',
        default: "'RESIDENT'",
        isNullable: false,
      })
    );

    // 4. Migrate SuperAdmin back to ADMIN role
    await queryRunner.query(`
      UPDATE users
      SET role = 'ADMIN'
      WHERE is_super_admin = true
    `);

    // 5. Recreate role index
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_role',
        columnNames: ['role'],
      })
    );

    // 6. Drop is_super_admin column
    await queryRunner.dropColumn('users', 'is_super_admin');
  }
}
