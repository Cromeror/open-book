import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration to create the users table
 *
 * Creates the users table with:
 * - Authentication fields (email, password_hash)
 * - Profile fields (first_name, last_name, phone)
 * - Role and status fields
 * - Consent tracking fields (Colombian Law 1581/2012)
 * - Audit fields inherited from BaseEntity
 */
export class CreateUsersTable1736131300000 implements MigrationInterface {
  name = 'CreateUsersTable1736131300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for user roles
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'RESIDENT')
    `);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'user_role_enum',
            default: "'RESIDENT'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'public_account_consent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'consent_date',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'consent_ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'consent_user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'last_login_at',
            type: 'timestamptz',
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

    // Create index on email for faster lookups
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
        isUnique: true,
      })
    );

    // Create index on role for filtering
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_role',
        columnNames: ['role'],
      })
    );

    // Create index on is_active for filtering active users
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_is_active',
        columnNames: ['is_active'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('users', 'idx_users_is_active');
    await queryRunner.dropIndex('users', 'idx_users_role');
    await queryRunner.dropIndex('users', 'idx_users_email');

    // Drop table
    await queryRunner.dropTable('users');

    // Drop enum type
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
