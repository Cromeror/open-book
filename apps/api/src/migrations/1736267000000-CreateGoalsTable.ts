import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration to create tables for Goals (Objetivos de Recaudo)
 *
 * Creates:
 * - condominiums: Condominiums table (minimal for FK relationship)
 * - goals: Fundraising goals table
 * - goal_history: Status change audit trail
 *
 * Implements OB-004 epic requirements.
 */
export class CreateGoalsTable1736267000000 implements MigrationInterface {
  name = 'CreateGoalsTable1736267000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // Create goal_status enum
    // ============================================
    await queryRunner.query(`
      CREATE TYPE "goal_status_enum" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')
    `);

    // ============================================
    // Create condominiums table
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'condominiums',
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
            length: '200',
            isNullable: false,
          },
          {
            name: 'nit',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'unit_count',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
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

    // Create unique index on NIT (only when not null)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_condominiums_nit" ON "condominiums" ("nit") WHERE "nit" IS NOT NULL
    `);

    // ============================================
    // Create goals table
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'goals',
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
            length: '200',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'target_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'goal_status_enum',
            default: "'ACTIVE'",
          },
          {
            name: 'condominium_id',
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

    // Create indexes for goals
    await queryRunner.createIndex(
      'goals',
      new TableIndex({
        name: 'idx_goals_condominium',
        columnNames: ['condominium_id'],
      }),
    );

    await queryRunner.createIndex(
      'goals',
      new TableIndex({
        name: 'idx_goals_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'goals',
      new TableIndex({
        name: 'idx_goals_condominium_status',
        columnNames: ['condominium_id', 'status'],
      }),
    );

    // Create foreign key to condominiums
    await queryRunner.createForeignKey(
      'goals',
      new TableForeignKey({
        name: 'fk_goals_condominium',
        columnNames: ['condominium_id'],
        referencedTableName: 'condominiums',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // ============================================
    // Create goal_history table
    // ============================================
    await queryRunner.createTable(
      new Table({
        name: 'goal_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'goal_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'previous_status',
            type: 'goal_status_enum',
            isNullable: false,
          },
          {
            name: 'new_status',
            type: 'goal_status_enum',
            isNullable: false,
          },
          {
            name: 'justification',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for goal_history
    await queryRunner.createIndex(
      'goal_history',
      new TableIndex({
        name: 'idx_goal_history_goal',
        columnNames: ['goal_id'],
      }),
    );

    await queryRunner.createIndex(
      'goal_history',
      new TableIndex({
        name: 'idx_goal_history_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'goal_history',
      new TableIndex({
        name: 'idx_goal_history_goal_date',
        columnNames: ['goal_id', 'created_at'],
      }),
    );

    // Create foreign keys for goal_history
    await queryRunner.createForeignKey(
      'goal_history',
      new TableForeignKey({
        name: 'fk_goal_history_goal',
        columnNames: ['goal_id'],
        referencedTableName: 'goals',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'goal_history',
      new TableForeignKey({
        name: 'fk_goal_history_user',
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
      'goal_history',
      'fk_goal_history_user',
    );
    await queryRunner.dropForeignKey(
      'goal_history',
      'fk_goal_history_goal',
    );
    await queryRunner.dropForeignKey('goals', 'fk_goals_condominium');

    // Drop indexes
    await queryRunner.dropIndex(
      'goal_history',
      'idx_goal_history_goal_date',
    );
    await queryRunner.dropIndex(
      'goal_history',
      'idx_goal_history_user',
    );
    await queryRunner.dropIndex(
      'goal_history',
      'idx_goal_history_goal',
    );
    await queryRunner.dropIndex(
      'goals',
      'idx_goals_condominium_status',
    );
    await queryRunner.dropIndex('goals', 'idx_goals_status');
    await queryRunner.dropIndex('goals', 'idx_goals_condominium');
    await queryRunner.dropIndex('condominiums', 'idx_condominiums_nit');

    // Drop tables
    await queryRunner.dropTable('goal_history');
    await queryRunner.dropTable('goals');
    await queryRunner.dropTable('condominiums');

    // Drop enum
    await queryRunner.query(`DROP TYPE "goal_status_enum"`);
  }
}
