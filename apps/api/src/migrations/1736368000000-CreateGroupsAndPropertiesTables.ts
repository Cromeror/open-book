import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration to create tables for Groups, Properties, and PropertyResidents
 *
 * Creates:
 * - groups: Hierarchical groupings (towers, blocks, floors, etc.)
 * - properties: Leaf nodes (apartments, offices, parking, etc.)
 * - property_residents: User-property associations
 *
 * Implements OB-003 epic requirements.
 */
export class CreateGroupsAndPropertiesTables1736368000000
  implements MigrationInterface
{
  name = 'CreateGroupsAndPropertiesTables1736368000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // Create property_type enum
    // ============================================
    await queryRunner.query(`
      CREATE TYPE "property_type_enum" AS ENUM (
        'APARTMENT', 'OFFICE', 'COMMERCIAL', 'PARKING', 'STORAGE', 'OTHER'
      )
    `);

    // ============================================
    // Create relation_type enum
    // ============================================
    await queryRunner.query(`
      CREATE TYPE "relation_type_enum" AS ENUM ('OWNER', 'TENANT', 'OTHER')
    `);

    // ============================================
    // Create association_status enum
    // ============================================
    await queryRunner.query(`
      CREATE TYPE "association_status_enum" AS ENUM (
        'PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'
      )
    `);

    // ============================================
    // Create groups table
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'groups',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
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
            name: 'condominium_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'depth',
            type: 'integer',
            default: 1,
            isNullable: false,
          },
          {
            name: 'path',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'integer',
            default: 0,
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

    // Create indexes for groups
    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'idx_groups_condominium',
        columnNames: ['condominium_id'],
      }),
    );

    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'idx_groups_parent',
        columnNames: ['parent_id'],
      }),
    );

    await queryRunner.createIndex(
      'groups',
      new TableIndex({
        name: 'idx_groups_path',
        columnNames: ['path'],
      }),
    );

    // Create foreign keys for groups
    await queryRunner.createForeignKey(
      'groups',
      new TableForeignKey({
        name: 'fk_groups_condominium',
        columnNames: ['condominium_id'],
        referencedTableName: 'condominiums',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'groups',
      new TableForeignKey({
        name: 'fk_groups_parent',
        columnNames: ['parent_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // ============================================
    // Create properties table
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'properties',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'identifier',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            default: "'APARTMENT'",
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'floor',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'area',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'condominium_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'group_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'integer',
            default: 0,
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

    // Create indexes for properties
    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'idx_properties_condominium',
        columnNames: ['condominium_id'],
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'idx_properties_group',
        columnNames: ['group_id'],
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'idx_properties_identifier',
        columnNames: ['condominium_id', 'identifier'],
      }),
    );

    // Create foreign keys for properties
    await queryRunner.createForeignKey(
      'properties',
      new TableForeignKey({
        name: 'fk_properties_condominium',
        columnNames: ['condominium_id'],
        referencedTableName: 'condominiums',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'properties',
      new TableForeignKey({
        name: 'fk_properties_group',
        columnNames: ['group_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // ============================================
    // Create property_residents table
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'property_residents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'property_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'relation_type',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'approved_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'approved_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'rejection_reason',
            type: 'text',
            isNullable: true,
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

    // Create indexes for property_residents
    await queryRunner.createIndex(
      'property_residents',
      new TableIndex({
        name: 'idx_property_residents_property',
        columnNames: ['property_id'],
      }),
    );

    await queryRunner.createIndex(
      'property_residents',
      new TableIndex({
        name: 'idx_property_residents_user',
        columnNames: ['user_id'],
      }),
    );

    // Create unique partial index for active associations
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_property_residents_active_unique"
      ON "property_residents" ("property_id", "user_id")
      WHERE "status" = 'ACTIVE'
    `);

    // Create foreign keys for property_residents
    await queryRunner.createForeignKey(
      'property_residents',
      new TableForeignKey({
        name: 'fk_property_residents_property',
        columnNames: ['property_id'],
        referencedTableName: 'properties',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'property_residents',
      new TableForeignKey({
        name: 'fk_property_residents_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'property_residents',
      'fk_property_residents_user',
    );
    await queryRunner.dropForeignKey(
      'property_residents',
      'fk_property_residents_property',
    );
    await queryRunner.dropForeignKey('properties', 'fk_properties_group');
    await queryRunner.dropForeignKey('properties', 'fk_properties_condominium');
    await queryRunner.dropForeignKey('groups', 'fk_groups_parent');
    await queryRunner.dropForeignKey('groups', 'fk_groups_condominium');

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_property_residents_active_unique"`,
    );
    await queryRunner.dropIndex(
      'property_residents',
      'idx_property_residents_user',
    );
    await queryRunner.dropIndex(
      'property_residents',
      'idx_property_residents_property',
    );
    await queryRunner.dropIndex('properties', 'idx_properties_identifier');
    await queryRunner.dropIndex('properties', 'idx_properties_group');
    await queryRunner.dropIndex('properties', 'idx_properties_condominium');
    await queryRunner.dropIndex('groups', 'idx_groups_path');
    await queryRunner.dropIndex('groups', 'idx_groups_parent');
    await queryRunner.dropIndex('groups', 'idx_groups_condominium');

    // Drop tables
    await queryRunner.dropTable('property_residents');
    await queryRunner.dropTable('properties');
    await queryRunner.dropTable('groups');

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "association_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "relation_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "property_type_enum"`);
  }
}
