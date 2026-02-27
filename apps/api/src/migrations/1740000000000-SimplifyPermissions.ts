import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to simplify the permissions system
 *
 * Changes:
 * - Deduplicate user_permissions rows that differ only by scope
 * - Deduplicate pool_permissions rows that differ only by scope
 * - Drop scope/scope_id columns from user_permissions and pool_permissions
 * - Update unique indexes
 * - Drop user_modules table (module access now inferred from permissions)
 * - Drop pool_modules table (same reason)
 */
export class SimplifyPermissions1740000000000 implements MigrationInterface {
  name = 'SimplifyPermissions1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Deduplicate user_permissions: keep one row per (user_id, module_permission_id)
    //    Prefer broader scope: all > copropiedad > own
    await queryRunner.query(`
      DELETE FROM user_permissions
      WHERE id NOT IN (
        SELECT DISTINCT ON (user_id, module_permission_id) id
        FROM user_permissions
        ORDER BY user_id, module_permission_id,
          CASE scope
            WHEN 'all' THEN 1
            WHEN 'copropiedad' THEN 2
            WHEN 'own' THEN 3
            ELSE 4
          END,
          created_at ASC
      )
    `);

    // 2. Deduplicate pool_permissions: keep one row per (pool_id, module_permission_id)
    await queryRunner.query(`
      DELETE FROM pool_permissions
      WHERE id NOT IN (
        SELECT DISTINCT ON (pool_id, module_permission_id) id
        FROM pool_permissions
        ORDER BY pool_id, module_permission_id,
          CASE scope
            WHEN 'all' THEN 1
            WHEN 'copropiedad' THEN 2
            WHEN 'own' THEN 3
            ELSE 4
          END,
          created_at ASC
      )
    `);

    // 3. Drop old unique indexes on user_permissions
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_user_permissions_unique"
    `);

    // 4. Drop scope columns from user_permissions
    await queryRunner.query(`
      ALTER TABLE user_permissions DROP COLUMN IF EXISTS scope
    `);
    await queryRunner.query(`
      ALTER TABLE user_permissions DROP COLUMN IF EXISTS scope_id
    `);

    // 5. Create new unique index on user_permissions
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_user_permissions_unique"
      ON user_permissions (user_id, module_permission_id)
    `);

    // 6. Drop old unique indexes on pool_permissions
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_pool_permissions_unique"
    `);

    // 7. Drop scope columns from pool_permissions
    await queryRunner.query(`
      ALTER TABLE pool_permissions DROP COLUMN IF EXISTS scope
    `);
    await queryRunner.query(`
      ALTER TABLE pool_permissions DROP COLUMN IF EXISTS scope_id
    `);

    // 8. Create new unique index on pool_permissions
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_pool_permissions_unique"
      ON pool_permissions (pool_id, module_permission_id)
    `);

    // 9. Drop user_modules table
    await queryRunner.query(`DROP TABLE IF EXISTS user_modules CASCADE`);

    // 10. Drop pool_modules table
    await queryRunner.query(`DROP TABLE IF EXISTS pool_modules CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate user_modules table
    await queryRunner.query(`
      CREATE TABLE user_modules (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        granted_by uuid NOT NULL,
        granted_at timestamptz NOT NULL,
        expires_at timestamptz,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_user_modules_user_module" ON user_modules (user_id, module_id)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_user_modules_user_id" ON user_modules (user_id)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_user_modules_module_id" ON user_modules (module_id)
    `);

    // Recreate pool_modules table
    await queryRunner.query(`
      CREATE TABLE pool_modules (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        pool_id uuid NOT NULL REFERENCES user_pools(id) ON DELETE CASCADE,
        module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        granted_by uuid NOT NULL,
        granted_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_pool_modules_unique" ON pool_modules (pool_id, module_id)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_pool_modules_pool_id" ON pool_modules (pool_id)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_pool_modules_module_id" ON pool_modules (module_id)
    `);

    // Re-add scope columns to user_permissions
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_permissions_unique"`);
    await queryRunner.query(`
      ALTER TABLE user_permissions
      ADD COLUMN scope varchar(20) DEFAULT 'own' NOT NULL,
      ADD COLUMN scope_id uuid
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_user_permissions_unique"
      ON user_permissions (user_id, module_permission_id, scope, scope_id)
    `);

    // Re-add scope columns to pool_permissions
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_pool_permissions_unique"`);
    await queryRunner.query(`
      ALTER TABLE pool_permissions
      ADD COLUMN scope varchar(20) DEFAULT 'own' NOT NULL,
      ADD COLUMN scope_id uuid
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_pool_permissions_unique"
      ON pool_permissions (pool_id, module_permission_id, scope, scope_id)
    `);
  }
}
