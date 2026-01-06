import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration to create all permissions-related tables
 *
 * Creates:
 * - modules: System modules
 * - module_permissions: Available permissions per module
 * - user_modules: User access to modules
 * - user_permissions: Granular user permissions
 * - user_pools: User groups with shared permissions
 * - user_pool_members: Pool membership
 * - pool_modules: Pool access to modules
 * - pool_permissions: Granular pool permissions
 */
export class CreatePermissionsTables1736161000000 implements MigrationInterface {
  name = 'CreatePermissionsTables1736161000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============ MODULES ============
    await queryRunner.createTable(
      new Table({
        name: 'modules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'modules',
      new TableIndex({
        name: 'idx_modules_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // ============ MODULE_PERMISSIONS ============
    await queryRunner.createTable(
      new Table({
        name: 'module_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'module_id',
            type: 'uuid',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'module_permissions',
      new TableIndex({
        name: 'idx_module_permissions_module_id',
        columnNames: ['module_id'],
      }),
    );

    await queryRunner.createIndex(
      'module_permissions',
      new TableIndex({
        name: 'idx_module_permissions_module_code',
        columnNames: ['module_id', 'code'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'module_permissions',
      new TableForeignKey({
        name: 'fk_module_permissions_module',
        columnNames: ['module_id'],
        referencedTableName: 'modules',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ============ USER_MODULES ============
    await queryRunner.createTable(
      new Table({
        name: 'user_modules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'module_id',
            type: 'uuid',
          },
          {
            name: 'granted_by',
            type: 'uuid',
          },
          {
            name: 'granted_at',
            type: 'timestamptz',
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_modules',
      new TableIndex({
        name: 'idx_user_modules_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_modules',
      new TableIndex({
        name: 'idx_user_modules_module_id',
        columnNames: ['module_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_modules',
      new TableIndex({
        name: 'idx_user_modules_user_module',
        columnNames: ['user_id', 'module_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'user_modules',
      new TableForeignKey({
        name: 'fk_user_modules_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_modules',
      new TableForeignKey({
        name: 'fk_user_modules_module',
        columnNames: ['module_id'],
        referencedTableName: 'modules',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ============ USER_PERMISSIONS ============
    await queryRunner.createTable(
      new Table({
        name: 'user_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'module_permission_id',
            type: 'uuid',
          },
          {
            name: 'scope',
            type: 'varchar',
            length: '20',
            default: "'own'",
          },
          {
            name: 'scope_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'granted_by',
            type: 'uuid',
          },
          {
            name: 'granted_at',
            type: 'timestamptz',
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_permissions',
      new TableIndex({
        name: 'idx_user_permissions_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_permissions',
      new TableIndex({
        name: 'idx_user_permissions_module_permission_id',
        columnNames: ['module_permission_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_permissions',
      new TableIndex({
        name: 'idx_user_permissions_unique',
        columnNames: ['user_id', 'module_permission_id', 'scope', 'scope_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'user_permissions',
      new TableForeignKey({
        name: 'fk_user_permissions_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_permissions',
      new TableForeignKey({
        name: 'fk_user_permissions_module_permission',
        columnNames: ['module_permission_id'],
        referencedTableName: 'module_permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ============ USER_POOLS ============
    await queryRunner.createTable(
      new Table({
        name: 'user_pools',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // ============ USER_POOL_MEMBERS ============
    await queryRunner.createTable(
      new Table({
        name: 'user_pool_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'pool_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'added_by',
            type: 'uuid',
          },
          {
            name: 'added_at',
            type: 'timestamptz',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_pool_members',
      new TableIndex({
        name: 'idx_user_pool_members_pool_id',
        columnNames: ['pool_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_pool_members',
      new TableIndex({
        name: 'idx_user_pool_members_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_pool_members',
      new TableIndex({
        name: 'idx_user_pool_members_unique',
        columnNames: ['pool_id', 'user_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'user_pool_members',
      new TableForeignKey({
        name: 'fk_user_pool_members_pool',
        columnNames: ['pool_id'],
        referencedTableName: 'user_pools',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_pool_members',
      new TableForeignKey({
        name: 'fk_user_pool_members_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ============ POOL_MODULES ============
    await queryRunner.createTable(
      new Table({
        name: 'pool_modules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'pool_id',
            type: 'uuid',
          },
          {
            name: 'module_id',
            type: 'uuid',
          },
          {
            name: 'granted_by',
            type: 'uuid',
          },
          {
            name: 'granted_at',
            type: 'timestamptz',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'pool_modules',
      new TableIndex({
        name: 'idx_pool_modules_pool_id',
        columnNames: ['pool_id'],
      }),
    );

    await queryRunner.createIndex(
      'pool_modules',
      new TableIndex({
        name: 'idx_pool_modules_module_id',
        columnNames: ['module_id'],
      }),
    );

    await queryRunner.createIndex(
      'pool_modules',
      new TableIndex({
        name: 'idx_pool_modules_unique',
        columnNames: ['pool_id', 'module_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'pool_modules',
      new TableForeignKey({
        name: 'fk_pool_modules_pool',
        columnNames: ['pool_id'],
        referencedTableName: 'user_pools',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pool_modules',
      new TableForeignKey({
        name: 'fk_pool_modules_module',
        columnNames: ['module_id'],
        referencedTableName: 'modules',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ============ POOL_PERMISSIONS ============
    await queryRunner.createTable(
      new Table({
        name: 'pool_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'pool_id',
            type: 'uuid',
          },
          {
            name: 'module_permission_id',
            type: 'uuid',
          },
          {
            name: 'scope',
            type: 'varchar',
            length: '20',
            default: "'own'",
          },
          {
            name: 'scope_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'granted_by',
            type: 'uuid',
          },
          {
            name: 'granted_at',
            type: 'timestamptz',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'pool_permissions',
      new TableIndex({
        name: 'idx_pool_permissions_pool_id',
        columnNames: ['pool_id'],
      }),
    );

    await queryRunner.createIndex(
      'pool_permissions',
      new TableIndex({
        name: 'idx_pool_permissions_module_permission_id',
        columnNames: ['module_permission_id'],
      }),
    );

    await queryRunner.createIndex(
      'pool_permissions',
      new TableIndex({
        name: 'idx_pool_permissions_unique',
        columnNames: ['pool_id', 'module_permission_id', 'scope', 'scope_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'pool_permissions',
      new TableForeignKey({
        name: 'fk_pool_permissions_pool',
        columnNames: ['pool_id'],
        referencedTableName: 'user_pools',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pool_permissions',
      new TableForeignKey({
        name: 'fk_pool_permissions_module_permission',
        columnNames: ['module_permission_id'],
        referencedTableName: 'module_permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of creation
    await queryRunner.dropTable('pool_permissions');
    await queryRunner.dropTable('pool_modules');
    await queryRunner.dropTable('user_pool_members');
    await queryRunner.dropTable('user_pools');
    await queryRunner.dropTable('user_permissions');
    await queryRunner.dropTable('user_modules');
    await queryRunner.dropTable('module_permissions');
    await queryRunner.dropTable('modules');
  }
}
