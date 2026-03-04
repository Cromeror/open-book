import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration: add module_resources join table and remove the `type` column from modules.
 *
 * - The `type` column ('crud' | 'specialized') is no longer necessary.
 *   Module capabilities are now inferred from the HTTP methods of the associated resources.
 *
 * - The new `module_resources` table is a many-to-many join between modules and resources.
 *   A module can reference multiple resources, and a resource can be referenced by
 *   multiple modules.
 */
export class AddModuleResourcesAndRemoveType1740300000000 implements MigrationInterface {
  name = 'AddModuleResourcesAndRemoveType1740300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create module_resources join table
    await queryRunner.createTable(
      new Table({
        name: 'module_resources',
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
            isNullable: false,
          },
          {
            name: 'resource_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Optional label describing the role of this resource in the module (e.g. primary, detail)',
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

    // Unique constraint: a module can reference the same resource only once
    await queryRunner.createIndex(
      'module_resources',
      new TableIndex({
        name: 'idx_module_resources_unique',
        columnNames: ['module_id', 'resource_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'module_resources',
      new TableIndex({
        name: 'idx_module_resources_module_id',
        columnNames: ['module_id'],
      }),
    );

    await queryRunner.createIndex(
      'module_resources',
      new TableIndex({
        name: 'idx_module_resources_resource_id',
        columnNames: ['resource_id'],
      }),
    );

    // FK: module_resources.module_id → modules.id
    await queryRunner.createForeignKey(
      'module_resources',
      new TableForeignKey({
        name: 'fk_module_resources_module',
        columnNames: ['module_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'modules',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // FK: module_resources.resource_id → resources.id
    await queryRunner.createForeignKey(
      'module_resources',
      new TableForeignKey({
        name: 'fk_module_resources_resource',
        columnNames: ['resource_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'resources',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // 2. Drop the `type` column from modules
    await queryRunner.dropColumn('modules', 'type');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the `type` column with a safe default
    await queryRunner.query(`
      ALTER TABLE "modules"
      ADD COLUMN "type" varchar(20) NOT NULL DEFAULT 'crud'
    `);

    // Drop module_resources table
    await queryRunner.dropForeignKey('module_resources', 'fk_module_resources_resource');
    await queryRunner.dropForeignKey('module_resources', 'fk_module_resources_module');
    await queryRunner.dropIndex('module_resources', 'idx_module_resources_resource_id');
    await queryRunner.dropIndex('module_resources', 'idx_module_resources_module_id');
    await queryRunner.dropIndex('module_resources', 'idx_module_resources_unique');
    await queryRunner.dropTable('module_resources');
  }
}
