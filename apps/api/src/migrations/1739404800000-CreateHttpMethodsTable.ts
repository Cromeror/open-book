import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

/**
 * Migration to create the http_methods table
 *
 * This table stores the standard REST HTTP methods that can be used
 * to interact with resources. Each method represents a standard HTTP verb
 * (GET, POST, PUT, PATCH, DELETE, etc.).
 *
 * The http_methods table provides a catalog of available HTTP methods
 * that can be associated with resources through the resource_http_methods
 * junction table.
 */
export class CreateHttpMethodsTable1739404800000 implements MigrationInterface {
  name = 'CreateHttpMethodsTable1739404800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the http_methods table
    await queryRunner.createTable(
      new Table({
        name: 'http_methods',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'method',
            type: 'varchar',
            length: '10',
            isUnique: true,
            isNullable: false,
            comment: 'HTTP method verb (GET, POST, PUT, PATCH, DELETE, etc.)',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Description of the HTTP method purpose',
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

    // Create unique index on method
    await queryRunner.createIndex(
      'http_methods',
      new TableIndex({
        name: 'idx_http_methods_method',
        columnNames: ['method'],
        isUnique: true,
      }),
    );

    // Seed standard REST HTTP methods
    await queryRunner.query(`
      INSERT INTO http_methods (method, description)
      VALUES
        ('GET', 'Retrieve resource(s)'),
        ('POST', 'Create a new resource'),
        ('PUT', 'Update/replace a resource'),
        ('PATCH', 'Partially update a resource'),
        ('DELETE', 'Delete a resource'),
        ('HEAD', 'Retrieve headers only'),
        ('OPTIONS', 'Get available methods for resource')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('http_methods', 'idx_http_methods_method');
    await queryRunner.dropTable('http_methods');
  }
}
