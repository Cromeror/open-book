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

export class AddResourceAccess1741306400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── user_resource_access ──
    await queryRunner.createTable(
      new Table({
        name: 'user_resource_access',
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
            name: 'resource_id',
            type: 'uuid',
          },
          {
            name: 'resource_http_method_id',
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
            name: 'response_filter',
            type: 'jsonb',
            isNullable: true,
          },
          ...AUDIT_COLUMNS,
        ],
      }),
      true,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'user_resource_access',
      new TableForeignKey({
        name: 'fk_user_resource_access_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_resource_access',
      new TableForeignKey({
        name: 'fk_user_resource_access_resource',
        columnNames: ['resource_id'],
        referencedTableName: 'resources',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_resource_access',
      new TableForeignKey({
        name: 'fk_user_resource_access_rhm',
        columnNames: ['resource_http_method_id'],
        referencedTableName: 'resource_http_methods',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Standard indexes
    await queryRunner.createIndex(
      'user_resource_access',
      new TableIndex({
        name: 'idx_user_resource_access_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_resource_access',
      new TableIndex({
        name: 'idx_user_resource_access_resource_id',
        columnNames: ['resource_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_resource_access',
      new TableIndex({
        name: 'idx_user_resource_access_rhm_id',
        columnNames: ['resource_http_method_id'],
      }),
    );

    // Partial unique indexes (nullable column requires raw SQL)
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_user_resource_access_unique_method
        ON user_resource_access (user_id, resource_id, resource_http_method_id)
        WHERE resource_http_method_id IS NOT NULL AND deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_user_resource_access_unique_wildcard
        ON user_resource_access (user_id, resource_id)
        WHERE resource_http_method_id IS NULL AND deleted_at IS NULL;
    `);

    // ── pool_resource_access ──
    await queryRunner.createTable(
      new Table({
        name: 'pool_resource_access',
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
            name: 'resource_id',
            type: 'uuid',
          },
          {
            name: 'resource_http_method_id',
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
            name: 'response_filter',
            type: 'jsonb',
            isNullable: true,
          },
          ...AUDIT_COLUMNS,
        ],
      }),
      true,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'pool_resource_access',
      new TableForeignKey({
        name: 'fk_pool_resource_access_pool',
        columnNames: ['pool_id'],
        referencedTableName: 'user_pools',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pool_resource_access',
      new TableForeignKey({
        name: 'fk_pool_resource_access_resource',
        columnNames: ['resource_id'],
        referencedTableName: 'resources',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pool_resource_access',
      new TableForeignKey({
        name: 'fk_pool_resource_access_rhm',
        columnNames: ['resource_http_method_id'],
        referencedTableName: 'resource_http_methods',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Standard indexes
    await queryRunner.createIndex(
      'pool_resource_access',
      new TableIndex({
        name: 'idx_pool_resource_access_pool_id',
        columnNames: ['pool_id'],
      }),
    );

    await queryRunner.createIndex(
      'pool_resource_access',
      new TableIndex({
        name: 'idx_pool_resource_access_resource_id',
        columnNames: ['resource_id'],
      }),
    );

    await queryRunner.createIndex(
      'pool_resource_access',
      new TableIndex({
        name: 'idx_pool_resource_access_rhm_id',
        columnNames: ['resource_http_method_id'],
      }),
    );

    // Partial unique indexes
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_pool_resource_access_unique_method
        ON pool_resource_access (pool_id, resource_id, resource_http_method_id)
        WHERE resource_http_method_id IS NOT NULL AND deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_pool_resource_access_unique_wildcard
        ON pool_resource_access (pool_id, resource_id)
        WHERE resource_http_method_id IS NULL AND deleted_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop partial unique indexes (raw SQL)
    await queryRunner.query('DROP INDEX IF EXISTS idx_pool_resource_access_unique_wildcard');
    await queryRunner.query('DROP INDEX IF EXISTS idx_pool_resource_access_unique_method');

    // Drop pool_resource_access
    await queryRunner.dropForeignKey('pool_resource_access', 'fk_pool_resource_access_rhm');
    await queryRunner.dropForeignKey('pool_resource_access', 'fk_pool_resource_access_resource');
    await queryRunner.dropForeignKey('pool_resource_access', 'fk_pool_resource_access_pool');
    await queryRunner.dropIndex('pool_resource_access', 'idx_pool_resource_access_rhm_id');
    await queryRunner.dropIndex('pool_resource_access', 'idx_pool_resource_access_resource_id');
    await queryRunner.dropIndex('pool_resource_access', 'idx_pool_resource_access_pool_id');
    await queryRunner.dropTable('pool_resource_access');

    // Drop partial unique indexes (raw SQL)
    await queryRunner.query('DROP INDEX IF EXISTS idx_user_resource_access_unique_wildcard');
    await queryRunner.query('DROP INDEX IF EXISTS idx_user_resource_access_unique_method');

    // Drop user_resource_access
    await queryRunner.dropForeignKey('user_resource_access', 'fk_user_resource_access_rhm');
    await queryRunner.dropForeignKey('user_resource_access', 'fk_user_resource_access_resource');
    await queryRunner.dropForeignKey('user_resource_access', 'fk_user_resource_access_user');
    await queryRunner.dropIndex('user_resource_access', 'idx_user_resource_access_rhm_id');
    await queryRunner.dropIndex('user_resource_access', 'idx_user_resource_access_resource_id');
    await queryRunner.dropIndex('user_resource_access', 'idx_user_resource_access_user_id');
    await queryRunner.dropTable('user_resource_access');
  }
}
