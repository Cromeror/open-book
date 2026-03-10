import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const AUDIT_COLUMNS = [
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
];

export class AddExternalPermissions1741306500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. external_users ──
    await queryRunner.createTable(
      new Table({
        name: 'external_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'external_id', type: 'varchar', length: '255' },
          { name: 'integration_id', type: 'uuid' },
          { name: 'name', type: 'varchar', length: '255', isNullable: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          ...AUDIT_COLUMNS,
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'external_users',
      new TableForeignKey({
        name: 'fk_external_users_integration',
        columnNames: ['integration_id'],
        referencedTableName: 'integrations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex('external_users', new TableIndex({ name: 'idx_external_users_external_id', columnNames: ['external_id'] }));
    await queryRunner.createIndex('external_users', new TableIndex({ name: 'idx_external_users_integration_id', columnNames: ['integration_id'] }));

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_external_users_unique
        ON external_users (external_id, integration_id)
        WHERE deleted_at IS NULL;
    `);

    // ── 2. external_pool_members (links external_users → user_pools) ──
    await queryRunner.createTable(
      new Table({
        name: 'external_pool_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'external_user_id', type: 'uuid' },
          { name: 'pool_id', type: 'uuid' },
          { name: 'added_by', type: 'uuid' },
          { name: 'added_at', type: 'timestamptz' },
          ...AUDIT_COLUMNS,
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'external_pool_members',
      new TableForeignKey({
        name: 'fk_ext_pool_members_external_user',
        columnNames: ['external_user_id'],
        referencedTableName: 'external_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'external_pool_members',
      new TableForeignKey({
        name: 'fk_ext_pool_members_pool',
        columnNames: ['pool_id'],
        referencedTableName: 'user_pools',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex('external_pool_members', new TableIndex({ name: 'idx_ext_pool_members_external_user_id', columnNames: ['external_user_id'] }));
    await queryRunner.createIndex('external_pool_members', new TableIndex({ name: 'idx_ext_pool_members_pool_id', columnNames: ['pool_id'] }));

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_ext_pool_members_unique
        ON external_pool_members (external_user_id, pool_id)
        WHERE deleted_at IS NULL;
    `);

    // ── 3. external_user_permissions ──
    await queryRunner.createTable(
      new Table({
        name: 'external_user_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'external_user_id', type: 'uuid' },
          { name: 'module_permission_id', type: 'uuid' },
          { name: 'granted_by', type: 'uuid' },
          { name: 'granted_at', type: 'timestamptz' },
          { name: 'expires_at', type: 'timestamptz', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          ...AUDIT_COLUMNS,
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'external_user_permissions',
      new TableForeignKey({
        name: 'fk_ext_user_permissions_external_user',
        columnNames: ['external_user_id'],
        referencedTableName: 'external_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'external_user_permissions',
      new TableForeignKey({
        name: 'fk_ext_user_permissions_module_permission',
        columnNames: ['module_permission_id'],
        referencedTableName: 'module_permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex('external_user_permissions', new TableIndex({ name: 'idx_ext_user_permissions_external_user_id', columnNames: ['external_user_id'] }));
    await queryRunner.createIndex('external_user_permissions', new TableIndex({ name: 'idx_ext_user_permissions_module_permission_id', columnNames: ['module_permission_id'] }));

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_ext_user_permissions_unique
        ON external_user_permissions (external_user_id, module_permission_id)
        WHERE deleted_at IS NULL;
    `);

    // ── 4. external_user_resource_access ──
    await queryRunner.createTable(
      new Table({
        name: 'external_user_resource_access',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'external_user_id', type: 'uuid' },
          { name: 'resource_id', type: 'uuid' },
          { name: 'resource_http_method_id', type: 'uuid', isNullable: true },
          { name: 'granted_by', type: 'uuid' },
          { name: 'granted_at', type: 'timestamptz' },
          { name: 'expires_at', type: 'timestamptz', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'response_filter', type: 'jsonb', isNullable: true },
          ...AUDIT_COLUMNS,
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('external_user_resource_access', new TableForeignKey({ name: 'fk_ext_user_resource_access_external_user', columnNames: ['external_user_id'], referencedTableName: 'external_users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('external_user_resource_access', new TableForeignKey({ name: 'fk_ext_user_resource_access_resource', columnNames: ['resource_id'], referencedTableName: 'resources', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('external_user_resource_access', new TableForeignKey({ name: 'fk_ext_user_resource_access_rhm', columnNames: ['resource_http_method_id'], referencedTableName: 'resource_http_methods', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    await queryRunner.createIndex('external_user_resource_access', new TableIndex({ name: 'idx_ext_user_resource_access_external_user_id', columnNames: ['external_user_id'] }));
    await queryRunner.createIndex('external_user_resource_access', new TableIndex({ name: 'idx_ext_user_resource_access_resource_id', columnNames: ['resource_id'] }));

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_ext_user_resource_access_unique_method
        ON external_user_resource_access (external_user_id, resource_id, resource_http_method_id)
        WHERE resource_http_method_id IS NOT NULL AND deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_ext_user_resource_access_unique_wildcard
        ON external_user_resource_access (external_user_id, resource_id)
        WHERE resource_http_method_id IS NULL AND deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order

    // 4. external_user_resource_access
    await queryRunner.query('DROP INDEX IF EXISTS idx_ext_user_resource_access_unique_wildcard');
    await queryRunner.query('DROP INDEX IF EXISTS idx_ext_user_resource_access_unique_method');
    await queryRunner.dropTable('external_user_resource_access', true, true, true);

    // 3. external_user_permissions
    await queryRunner.query('DROP INDEX IF EXISTS idx_ext_user_permissions_unique');
    await queryRunner.dropTable('external_user_permissions', true, true, true);

    // 2. external_pool_members
    await queryRunner.query('DROP INDEX IF EXISTS idx_ext_pool_members_unique');
    await queryRunner.dropTable('external_pool_members', true, true, true);

    // 1. external_users
    await queryRunner.query('DROP INDEX IF EXISTS idx_external_users_unique');
    await queryRunner.dropTable('external_users', true, true, true);
  }
}
