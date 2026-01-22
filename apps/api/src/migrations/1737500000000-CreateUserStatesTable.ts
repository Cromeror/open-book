import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration to create the user_states table
 *
 * This table stores user-specific state and preferences that persist
 * across sessions, such as the currently selected condominium, theme, etc.
 */
export class CreateUserStatesTable1737500000000 implements MigrationInterface {
  name = 'CreateUserStatesTable1737500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_states',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'selected_condominium_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'theme',
            type: 'varchar',
            length: '20',
            default: "'system'",
            isNullable: false,
          },
          {
            name: 'sidebar_collapsed',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            default: "'es'",
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

    // Create index on user_id
    await queryRunner.createIndex(
      'user_states',
      new TableIndex({
        name: 'idx_user_states_user_id',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );

    // Create foreign key to users
    await queryRunner.createForeignKey(
      'user_states',
      new TableForeignKey({
        name: 'fk_user_states_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign key to condominiums (optional reference)
    await queryRunner.createForeignKey(
      'user_states',
      new TableForeignKey({
        name: 'fk_user_states_condominium',
        columnNames: ['selected_condominium_id'],
        referencedTableName: 'condominiums',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_states', 'fk_user_states_condominium');
    await queryRunner.dropForeignKey('user_states', 'fk_user_states_user');
    await queryRunner.dropIndex('user_states', 'idx_user_states_user_id');
    await queryRunner.dropTable('user_states');
  }
}
