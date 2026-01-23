import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: Create capability_presets table
 *
 * Creates the table for storing predefined capability templates used in
 * HATEOAS resource configuration. Includes default system presets.
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

    // Insert default system presets
    await queryRunner.query(`
      INSERT INTO capability_presets (id, label, description, capabilities, is_system, is_active, "order")
      VALUES
        (
          'crud',
          'CRUD Completo',
          'Operaciones de Create, Read, Update, Delete',
          '[
            {"name": "list", "method": "GET", "urlPattern": ""},
            {"name": "get", "method": "GET", "urlPattern": "/{id}"},
            {"name": "create", "method": "POST", "urlPattern": ""},
            {"name": "update", "method": "PATCH", "urlPattern": "/{id}"},
            {"name": "delete", "method": "DELETE", "urlPattern": "/{id}"}
          ]'::jsonb,
          true,
          true,
          1
        ),
        (
          'readOnly',
          'Solo Lectura',
          'Solo operaciones de consulta (sin modificaciones)',
          '[
            {"name": "list", "method": "GET", "urlPattern": ""},
            {"name": "get", "method": "GET", "urlPattern": "/{id}"}
          ]'::jsonb,
          true,
          true,
          2
        ),
        (
          'custom',
          'Personalizado',
          'Iniciar con una lista vacía de capacidades',
          '[]'::jsonb,
          true,
          true,
          3
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('capability_presets');
  }
}
