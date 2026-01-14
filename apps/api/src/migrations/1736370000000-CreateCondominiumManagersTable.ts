import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration to create the condominium_managers table
 *
 * This table represents the many-to-many relationship between users and condominiums
 * where the user holds a managerial or administrative role.
 */
export class CreateCondominiumManagersTable1736370000000
  implements MigrationInterface
{
  name = 'CreateCondominiumManagersTable1736370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // Create condominium_managers table
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'condominium_managers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'condominium_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'is_primary',
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
            name: 'assigned_at',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'assigned_by',
            type: 'uuid',
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

    // Create indexes
    await queryRunner.createIndex(
      'condominium_managers',
      new TableIndex({
        name: 'idx_condominium_managers_condominium',
        columnNames: ['condominium_id'],
      }),
    );

    await queryRunner.createIndex(
      'condominium_managers',
      new TableIndex({
        name: 'idx_condominium_managers_user',
        columnNames: ['user_id'],
      }),
    );

    // Create unique index for condominium + user combination
    await queryRunner.createIndex(
      'condominium_managers',
      new TableIndex({
        name: 'idx_condominium_managers_unique',
        columnNames: ['condominium_id', 'user_id'],
        isUnique: true,
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'condominium_managers',
      new TableForeignKey({
        name: 'fk_condominium_managers_condominium',
        columnNames: ['condominium_id'],
        referencedTableName: 'condominiums',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'condominium_managers',
      new TableForeignKey({
        name: 'fk_condominium_managers_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'condominium_managers',
      new TableForeignKey({
        name: 'fk_condominium_managers_assigned_by',
        columnNames: ['assigned_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'condominium_managers',
      'fk_condominium_managers_assigned_by',
    );
    await queryRunner.dropForeignKey(
      'condominium_managers',
      'fk_condominium_managers_user',
    );
    await queryRunner.dropForeignKey(
      'condominium_managers',
      'fk_condominium_managers_condominium',
    );

    // Drop indexes
    await queryRunner.dropIndex(
      'condominium_managers',
      'idx_condominium_managers_unique',
    );
    await queryRunner.dropIndex(
      'condominium_managers',
      'idx_condominium_managers_user',
    );
    await queryRunner.dropIndex(
      'condominium_managers',
      'idx_condominium_managers_condominium',
    );

    // Drop table
    await queryRunner.dropTable('condominium_managers');
  }
}
