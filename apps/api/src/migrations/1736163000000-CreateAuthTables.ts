import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

/**
 * Migration to create authentication-related tables
 *
 * Creates:
 * - refresh_tokens: Stores refresh tokens for JWT rotation
 * - auth_logs: Audit log for authentication events
 */
export class CreateAuthTables1736163000000 implements MigrationInterface {
  name = 'CreateAuthTables1736163000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create auth_event enum
    await queryRunner.query(`
      CREATE TYPE "auth_event_enum" AS ENUM (
        'LOGIN',
        'LOGIN_FAILED',
        'LOGOUT',
        'REFRESH',
        'PASSWORD_RESET',
        'PASSWORD_CHANGE',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED'
      )
    `);

    // Create refresh_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'revoked_at',
            type: 'timestamptz',
            isNullable: true,
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
      true
    );

    // Create indexes on refresh_tokens
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'idx_refresh_tokens_token',
        columnNames: ['token'],
      })
    );

    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'idx_refresh_tokens_user_id',
        columnNames: ['user_id'],
      })
    );

    // Create foreign key for refresh_tokens -> users
    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        name: 'fk_refresh_tokens_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Create auth_logs table
    await queryRunner.createTable(
      new Table({
        name: 'auth_logs',
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
            isNullable: true, // Nullable for failed login attempts
          },
          {
            name: 'event',
            type: 'auth_event_enum',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: false,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'success',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'fail_reason',
            type: 'varchar',
            length: '255',
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
      true
    );

    // Create indexes on auth_logs
    await queryRunner.createIndex(
      'auth_logs',
      new TableIndex({
        name: 'idx_auth_logs_user_id',
        columnNames: ['user_id'],
      })
    );

    await queryRunner.createIndex(
      'auth_logs',
      new TableIndex({
        name: 'idx_auth_logs_event',
        columnNames: ['event'],
      })
    );

    await queryRunner.createIndex(
      'auth_logs',
      new TableIndex({
        name: 'idx_auth_logs_email',
        columnNames: ['email'],
      })
    );

    await queryRunner.createIndex(
      'auth_logs',
      new TableIndex({
        name: 'idx_auth_logs_created_at',
        columnNames: ['created_at'],
      })
    );

    // Create foreign key for auth_logs -> users (optional)
    await queryRunner.createForeignKey(
      'auth_logs',
      new TableForeignKey({
        name: 'fk_auth_logs_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('auth_logs', 'fk_auth_logs_user_id');
    await queryRunner.dropForeignKey(
      'refresh_tokens',
      'fk_refresh_tokens_user_id'
    );

    // Drop indexes on auth_logs
    await queryRunner.dropIndex('auth_logs', 'idx_auth_logs_created_at');
    await queryRunner.dropIndex('auth_logs', 'idx_auth_logs_email');
    await queryRunner.dropIndex('auth_logs', 'idx_auth_logs_event');
    await queryRunner.dropIndex('auth_logs', 'idx_auth_logs_user_id');

    // Drop auth_logs table
    await queryRunner.dropTable('auth_logs');

    // Drop indexes on refresh_tokens
    await queryRunner.dropIndex('refresh_tokens', 'idx_refresh_tokens_user_id');
    await queryRunner.dropIndex('refresh_tokens', 'idx_refresh_tokens_token');

    // Drop refresh_tokens table
    await queryRunner.dropTable('refresh_tokens');

    // Drop enum type
    await queryRunner.query(`DROP TYPE "auth_event_enum"`);
  }
}
