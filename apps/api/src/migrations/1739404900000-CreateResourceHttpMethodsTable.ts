import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration to create the resource_http_methods junction table
 *
 * This junction table creates a many-to-many relationship between resources
 * and HTTP methods. It stores additional metadata about the request payload
 * and successful response for each resource-method combination.
 *
 * Key features:
 * - payload_metadata: JSONB field storing schema/structure of expected request payload
 * - response_metadata: JSONB field storing schema/structure of successful response
 * - Composite unique constraint on (resource_id, http_method_id)
 * - Foreign keys with cascading deletes for referential integrity
 */
export class CreateResourceHttpMethodsTable1739404900000
  implements MigrationInterface
{
  name = 'CreateResourceHttpMethodsTable1739404900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the resource_http_methods junction table
    await queryRunner.createTable(
      new Table({
        name: 'resource_http_methods',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'resource_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Foreign key to resources table',
          },
          {
            name: 'http_method_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Foreign key to http_methods table',
          },
          {
            name: 'payload_metadata',
            type: 'jsonb',
            isNullable: true,
            default: 'null',
            comment:
              'JSON schema or metadata describing the expected request payload structure',
          },
          {
            name: 'response_metadata',
            type: 'jsonb',
            isNullable: true,
            default: 'null',
            comment:
              'JSON schema or metadata describing the successful response structure',
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

    // Create composite unique index on resource_id and http_method_id
    // to ensure each resource-method combination is unique
    await queryRunner.createIndex(
      'resource_http_methods',
      new TableIndex({
        name: 'idx_resource_http_methods_unique',
        columnNames: ['resource_id', 'http_method_id'],
        isUnique: true,
      }),
    );

    // Create index on resource_id for faster lookups
    await queryRunner.createIndex(
      'resource_http_methods',
      new TableIndex({
        name: 'idx_resource_http_methods_resource_id',
        columnNames: ['resource_id'],
      }),
    );

    // Create index on http_method_id for faster lookups
    await queryRunner.createIndex(
      'resource_http_methods',
      new TableIndex({
        name: 'idx_resource_http_methods_http_method_id',
        columnNames: ['http_method_id'],
      }),
    );

    // Add foreign key constraint to resources table
    await queryRunner.createForeignKey(
      'resource_http_methods',
      new TableForeignKey({
        name: 'fk_resource_http_methods_resource',
        columnNames: ['resource_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'resources',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key constraint to http_methods table
    await queryRunner.createForeignKey(
      'resource_http_methods',
      new TableForeignKey({
        name: 'fk_resource_http_methods_http_method',
        columnNames: ['http_method_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'http_methods',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'resource_http_methods',
      'fk_resource_http_methods_http_method',
    );
    await queryRunner.dropForeignKey(
      'resource_http_methods',
      'fk_resource_http_methods_resource',
    );

    // Drop indexes
    await queryRunner.dropIndex(
      'resource_http_methods',
      'idx_resource_http_methods_http_method_id',
    );
    await queryRunner.dropIndex(
      'resource_http_methods',
      'idx_resource_http_methods_resource_id',
    );
    await queryRunner.dropIndex(
      'resource_http_methods',
      'idx_resource_http_methods_unique',
    );

    // Drop table
    await queryRunner.dropTable('resource_http_methods');
  }
}
