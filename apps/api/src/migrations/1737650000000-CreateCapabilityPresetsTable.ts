import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: Create capability_presets table
 *
 * Creates the table for storing predefined capability templates used in
 * HATEOAS resource configuration. Admins can create custom presets via UI.
 */
export class CreateCapabilityPresetsTable1737650000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create capability_presets table
    await queryRunner.createTable(
      new Table({
        name: 'capability_presets',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '50',
            isPrimary: true,
          },
          {
            name: 'label',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'capabilities',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'is_system',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'order',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // No system presets seeded - admins can create their own via UI
    // Existing presets in database are preserved
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('capability_presets');
  }
}
