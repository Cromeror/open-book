import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

/**
 * Migration to create the resources table
 *
 * This table stores HATEOAS resource configuration using a unified capability model.
 * Resources define their available capabilities (CRUD + custom actions) which the
 * proxy uses to generate HATEOAS links at runtime.
 *
 * Key design: All capabilities are treated equally - no distinction between
 * standard and custom actions.
 */
export class CreateResourcesTable1737600000000 implements MigrationInterface {
  name = 'CreateResourcesTable1737600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'resources',
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
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'scope',
            type: 'varchar',
            length: '20',
            default: "'global'",
            isNullable: false,
          },
          {
            name: 'base_url',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'capabilities',
            type: 'jsonb',
            default: "'[]'",
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          // Audit fields from BaseEntity
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

    // Create unique index on code
    await queryRunner.createIndex(
      'resources',
      new TableIndex({
        name: 'idx_resources_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('resources', 'idx_resources_code');
    await queryRunner.dropTable('resources');
  }
}
