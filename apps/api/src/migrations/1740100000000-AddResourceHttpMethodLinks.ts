import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration to create the resource_http_method_links table
 *
 * This table stores HATEOAS link configurations between two ResourceHttpMethod entries.
 * Each row declares: "when the source endpoint returns an item, attach a link
 * named `rel` pointing to the target endpoint, mapping response fields to URL params."
 *
 * Key features:
 * - source_http_method_id: FK to resource_http_methods (the endpoint that returns the data)
 * - target_http_method_id: FK to resource_http_methods (the linked action)
 * - rel: link relation name (e.g., 'self', 'detail', 'delete')
 * - param_mappings: JSONB array of { responseField, urlParam } describing how to fill
 *   the target URL's placeholders from the response item's fields
 */
export class AddResourceHttpMethodLinks1740100000000 implements MigrationInterface {
  name = 'AddResourceHttpMethodLinks1740100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'resource_http_method_links',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'source_http_method_id',
            type: 'uuid',
            isNullable: false,
            comment: 'FK to resource_http_methods — the endpoint producing the items',
          },
          {
            name: 'target_http_method_id',
            type: 'uuid',
            isNullable: false,
            comment: 'FK to resource_http_methods — the linked action',
          },
          {
            name: 'rel',
            type: 'varchar',
            length: '64',
            isNullable: false,
            comment: 'Link relation name (e.g., self, detail, delete)',
          },
          {
            name: 'param_mappings',
            type: 'jsonb',
            isNullable: false,
            default: "'[]'",
            comment:
              'Array of { responseField, urlParam } mapping response fields to target URL placeholders',
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
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

    // Index on source for fast lookup when enriching responses
    await queryRunner.createIndex(
      'resource_http_method_links',
      new TableIndex({
        name: 'idx_resource_http_method_links_source',
        columnNames: ['source_http_method_id'],
      }),
    );

    // Index on target for reverse lookups
    await queryRunner.createIndex(
      'resource_http_method_links',
      new TableIndex({
        name: 'idx_resource_http_method_links_target',
        columnNames: ['target_http_method_id'],
      }),
    );

    // FK: source → resource_http_methods
    await queryRunner.createForeignKey(
      'resource_http_method_links',
      new TableForeignKey({
        name: 'fk_resource_http_method_links_source',
        columnNames: ['source_http_method_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'resource_http_methods',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // FK: target → resource_http_methods
    await queryRunner.createForeignKey(
      'resource_http_method_links',
      new TableForeignKey({
        name: 'fk_resource_http_method_links_target',
        columnNames: ['target_http_method_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'resource_http_methods',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'resource_http_method_links',
      'fk_resource_http_method_links_target',
    );
    await queryRunner.dropForeignKey(
      'resource_http_method_links',
      'fk_resource_http_method_links_source',
    );
    await queryRunner.dropIndex(
      'resource_http_method_links',
      'idx_resource_http_method_links_target',
    );
    await queryRunner.dropIndex(
      'resource_http_method_links',
      'idx_resource_http_method_links_source',
    );
    await queryRunner.dropTable('resource_http_method_links');
  }
}
