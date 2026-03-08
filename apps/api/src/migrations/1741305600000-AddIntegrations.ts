import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

/**
 * Adds the integrations table for external system connections.
 *
 * Integrations store connection configuration (base URL, auth type, etc.)
 * but NOT user credentials. In a "passthrough" connection, the user's
 * tokens come from the runtime context (e.g., postMessage from parent app).
 */
export class AddIntegrations1741305600000 implements MigrationInterface {
  name = 'AddIntegrations1741305600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enums
    await queryRunner.query(`
      CREATE TYPE "integration_auth_type_enum" AS ENUM (
        'none', 'bearer', 'basic', 'api_key', 'devise_token_auth'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "integration_connection_type_enum" AS ENUM (
        'passthrough', 'oauth', 'api_key_stored'
      )
    `);

    // Table: integrations
    await queryRunner.createTable(
      new Table({
        name: 'integrations',
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
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'base_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'auth_type',
            type: 'integration_auth_type_enum',
            default: `'none'`,
            isNullable: false,
          },
          {
            name: 'auth_config',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'connection_type',
            type: 'integration_connection_type_enum',
            default: `'passthrough'`,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
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
      'integrations',
      new TableIndex({
        name: 'idx_integrations_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('integrations', 'idx_integrations_code');
    await queryRunner.dropTable('integrations');
    await queryRunner.query('DROP TYPE "integration_connection_type_enum"');
    await queryRunner.query('DROP TYPE "integration_auth_type_enum"');
  }
}
