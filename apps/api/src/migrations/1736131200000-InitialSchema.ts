import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
  TableColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Consolidated initial schema migration
 *
 * Creates all tables for the OpenBook core platform:
 *
 * - users: User accounts with auth and consent fields
 * - refresh_tokens: JWT refresh token storage
 * - auth_logs: Authentication event audit trail
 * - modules: System module definitions with metadata
 * - module_permissions: Available permissions per module
 * - user_permissions: Direct user-permission assignments
 * - user_pools: User groups for shared permissions
 * - user_pool_members: Pool membership
 * - pool_permissions: Pool-level permission assignments
 * - resources: API resource registry for HATEOAS
 * - http_methods: Standard HTTP method catalog
 * - resource_http_methods: Resource-method associations
 * - resource_http_method_links: HATEOAS link configurations
 * - module_resources: Module-resource associations
 * - user_states: User preferences and session state
 * - capability_presets: HATEOAS capability templates
 *
 * Also seeds:
 * - HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
 * - Users module with CRUD permissions
 * - Test users (admin@test.com, user@test.com)
 */
export class InitialSchema1736131200000 implements MigrationInterface {
  name = 'InitialSchema1736131200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // Extensions
    // ============================================================
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`SET timezone = 'America/Bogota'`);

    // ============================================================
    // Enums
    // ============================================================
    await queryRunner.query(`
      CREATE TYPE "auth_event_enum" AS ENUM (
        'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'REFRESH',
        'PASSWORD_RESET', 'PASSWORD_CHANGE',
        'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED'
      )
    `);

    // ============================================================
    // Table: users
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true, isNullable: false },
          { name: 'password_hash', type: 'varchar', length: '255', isNullable: false },
          { name: 'first_name', type: 'varchar', length: '100', isNullable: false },
          { name: 'last_name', type: 'varchar', length: '100', isNullable: false },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'is_super_admin', type: 'boolean', default: false, isNullable: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'public_account_consent', type: 'boolean', default: false },
          { name: 'consent_date', type: 'timestamptz', isNullable: true },
          { name: 'consent_ip_address', type: 'varchar', length: '45', isNullable: true },
          { name: 'consent_user_agent', type: 'text', isNullable: true },
          { name: 'last_login_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('users', new TableIndex({ name: 'idx_users_email', columnNames: ['email'], isUnique: true }));
    await queryRunner.createIndex('users', new TableIndex({ name: 'idx_users_is_active', columnNames: ['is_active'] }));
    await queryRunner.createIndex('users', new TableIndex({ name: 'idx_users_is_super_admin', columnNames: ['is_super_admin'] }));

    // ============================================================
    // Table: refresh_tokens
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'token', type: 'varchar', length: '255', isNullable: false },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'expires_at', type: 'timestamptz', isNullable: false },
          { name: 'revoked_at', type: 'timestamptz', isNullable: true },
          { name: 'ip_address', type: 'varchar', length: '45', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('refresh_tokens', new TableIndex({ name: 'idx_refresh_tokens_token', columnNames: ['token'] }));
    await queryRunner.createIndex('refresh_tokens', new TableIndex({ name: 'idx_refresh_tokens_user_id', columnNames: ['user_id'] }));
    await queryRunner.createForeignKey('refresh_tokens', new TableForeignKey({ name: 'fk_refresh_tokens_user_id', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    // ============================================================
    // Table: auth_logs
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'auth_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'event', type: 'auth_event_enum', isNullable: false },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          { name: 'ip_address', type: 'varchar', length: '45', isNullable: false },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'success', type: 'boolean', isNullable: false },
          { name: 'fail_reason', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('auth_logs', new TableIndex({ name: 'idx_auth_logs_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('auth_logs', new TableIndex({ name: 'idx_auth_logs_event', columnNames: ['event'] }));
    await queryRunner.createIndex('auth_logs', new TableIndex({ name: 'idx_auth_logs_email', columnNames: ['email'] }));
    await queryRunner.createIndex('auth_logs', new TableIndex({ name: 'idx_auth_logs_created_at', columnNames: ['created_at'] }));
    await queryRunner.createForeignKey('auth_logs', new TableForeignKey({ name: 'fk_auth_logs_user_id', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL' }));

    // ============================================================
    // Table: modules (with metadata columns, without 'type' column)
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'modules',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'code', type: 'varchar', length: '50', isUnique: true },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'icon', type: 'varchar', length: '50', isNullable: true },
          { name: 'entity', type: 'varchar', length: '100', isNullable: true },
          { name: 'endpoint', type: 'varchar', length: '255', isNullable: true },
          { name: 'component', type: 'varchar', length: '100', isNullable: true },
          { name: 'nav_config', type: 'jsonb', isNullable: true },
          { name: 'actions_config', type: 'jsonb', isNullable: true },
          { name: 'order', type: 'integer', default: 0 },
          { name: 'tags', type: 'jsonb', default: "'[]'" },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('modules', new TableIndex({ name: 'idx_modules_code', columnNames: ['code'], isUnique: true }));

    // ============================================================
    // Table: module_permissions (with rels column)
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'module_permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'module_id', type: 'uuid' },
          { name: 'code', type: 'varchar', length: '50' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'rels', type: 'varchar', length: '500', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('module_permissions', new TableIndex({ name: 'idx_module_permissions_module_id', columnNames: ['module_id'] }));
    await queryRunner.createIndex('module_permissions', new TableIndex({ name: 'idx_module_permissions_module_code', columnNames: ['module_id', 'code'], isUnique: true }));
    await queryRunner.createForeignKey('module_permissions', new TableForeignKey({ name: 'fk_module_permissions_module', columnNames: ['module_id'], referencedTableName: 'modules', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    // ============================================================
    // Table: user_permissions (simplified, no scope)
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'user_permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'module_permission_id', type: 'uuid' },
          { name: 'granted_by', type: 'uuid' },
          { name: 'granted_at', type: 'timestamptz' },
          { name: 'expires_at', type: 'timestamptz', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('user_permissions', new TableIndex({ name: 'idx_user_permissions_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('user_permissions', new TableIndex({ name: 'idx_user_permissions_module_permission_id', columnNames: ['module_permission_id'] }));
    await queryRunner.createIndex('user_permissions', new TableIndex({ name: 'idx_user_permissions_unique', columnNames: ['user_id', 'module_permission_id'], isUnique: true }));
    await queryRunner.createForeignKey('user_permissions', new TableForeignKey({ name: 'fk_user_permissions_user', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('user_permissions', new TableForeignKey({ name: 'fk_user_permissions_module_permission', columnNames: ['module_permission_id'], referencedTableName: 'module_permissions', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    // ============================================================
    // Table: user_pools
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'user_pools',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    // ============================================================
    // Table: user_pool_members
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'user_pool_members',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'pool_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'added_by', type: 'uuid' },
          { name: 'added_at', type: 'timestamptz' },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('user_pool_members', new TableIndex({ name: 'idx_user_pool_members_pool_id', columnNames: ['pool_id'] }));
    await queryRunner.createIndex('user_pool_members', new TableIndex({ name: 'idx_user_pool_members_user_id', columnNames: ['user_id'] }));
    await queryRunner.createIndex('user_pool_members', new TableIndex({ name: 'idx_user_pool_members_unique', columnNames: ['pool_id', 'user_id'], isUnique: true }));
    await queryRunner.createForeignKey('user_pool_members', new TableForeignKey({ name: 'fk_user_pool_members_pool', columnNames: ['pool_id'], referencedTableName: 'user_pools', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('user_pool_members', new TableForeignKey({ name: 'fk_user_pool_members_user', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    // ============================================================
    // Table: pool_permissions (simplified, no scope)
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'pool_permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'pool_id', type: 'uuid' },
          { name: 'module_permission_id', type: 'uuid' },
          { name: 'granted_by', type: 'uuid' },
          { name: 'granted_at', type: 'timestamptz' },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('pool_permissions', new TableIndex({ name: 'idx_pool_permissions_pool_id', columnNames: ['pool_id'] }));
    await queryRunner.createIndex('pool_permissions', new TableIndex({ name: 'idx_pool_permissions_module_permission_id', columnNames: ['module_permission_id'] }));
    await queryRunner.createIndex('pool_permissions', new TableIndex({ name: 'idx_pool_permissions_unique', columnNames: ['pool_id', 'module_permission_id'], isUnique: true }));
    await queryRunner.createForeignKey('pool_permissions', new TableForeignKey({ name: 'fk_pool_permissions_pool', columnNames: ['pool_id'], referencedTableName: 'user_pools', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('pool_permissions', new TableForeignKey({ name: 'fk_pool_permissions_module_permission', columnNames: ['module_permission_id'], referencedTableName: 'module_permissions', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    // ============================================================
    // Table: resources (with template_url, description, no scope)
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'resources',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'code', type: 'varchar', length: '50', isUnique: true, isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'template_url', type: 'varchar', length: '255', isNullable: false },
          { name: 'is_active', type: 'boolean', default: true, isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('resources', new TableIndex({ name: 'idx_resources_code', columnNames: ['code'], isUnique: true }));

    // ============================================================
    // Table: http_methods
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'http_methods',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'method', type: 'varchar', length: '10', isUnique: true, isNullable: false },
          { name: 'description', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('http_methods', new TableIndex({ name: 'idx_http_methods_method', columnNames: ['method'], isUnique: true }));

    // ============================================================
    // Table: resource_http_methods
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'resource_http_methods',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'resource_id', type: 'uuid', isNullable: false },
          { name: 'http_method_id', type: 'uuid', isNullable: false },
          { name: 'payload_metadata', type: 'jsonb', isNullable: true, default: 'null' },
          { name: 'response_metadata', type: 'jsonb', isNullable: true, default: 'null' },
          { name: 'is_active', type: 'boolean', default: true, isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('resource_http_methods', new TableIndex({ name: 'idx_resource_http_methods_unique', columnNames: ['resource_id', 'http_method_id'], isUnique: true }));
    await queryRunner.createIndex('resource_http_methods', new TableIndex({ name: 'idx_resource_http_methods_resource_id', columnNames: ['resource_id'] }));
    await queryRunner.createIndex('resource_http_methods', new TableIndex({ name: 'idx_resource_http_methods_http_method_id', columnNames: ['http_method_id'] }));
    await queryRunner.createForeignKey('resource_http_methods', new TableForeignKey({ name: 'fk_resource_http_methods_resource', columnNames: ['resource_id'], referencedColumnNames: ['id'], referencedTableName: 'resources', onDelete: 'CASCADE', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('resource_http_methods', new TableForeignKey({ name: 'fk_resource_http_methods_http_method', columnNames: ['http_method_id'], referencedColumnNames: ['id'], referencedTableName: 'http_methods', onDelete: 'CASCADE', onUpdate: 'CASCADE' }));

    // ============================================================
    // Table: resource_http_method_links
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'resource_http_method_links',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'source_http_method_id', type: 'uuid', isNullable: false },
          { name: 'target_http_method_id', type: 'uuid', isNullable: false },
          { name: 'rel', type: 'varchar', length: '64', isNullable: false },
          { name: 'param_mappings', type: 'jsonb', isNullable: false, default: "'[]'" },
          { name: 'is_active', type: 'boolean', isNullable: false, default: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('resource_http_method_links', new TableIndex({ name: 'idx_resource_http_method_links_source', columnNames: ['source_http_method_id'] }));
    await queryRunner.createIndex('resource_http_method_links', new TableIndex({ name: 'idx_resource_http_method_links_target', columnNames: ['target_http_method_id'] }));
    await queryRunner.createForeignKey('resource_http_method_links', new TableForeignKey({ name: 'fk_resource_http_method_links_source', columnNames: ['source_http_method_id'], referencedColumnNames: ['id'], referencedTableName: 'resource_http_methods', onDelete: 'CASCADE', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('resource_http_method_links', new TableForeignKey({ name: 'fk_resource_http_method_links_target', columnNames: ['target_http_method_id'], referencedColumnNames: ['id'], referencedTableName: 'resource_http_methods', onDelete: 'CASCADE', onUpdate: 'CASCADE' }));

    // ============================================================
    // Table: module_resources
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'module_resources',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'module_id', type: 'uuid', isNullable: false },
          { name: 'resource_id', type: 'uuid', isNullable: false },
          { name: 'role', type: 'varchar', length: '50', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('module_resources', new TableIndex({ name: 'idx_module_resources_unique', columnNames: ['module_id', 'resource_id'], isUnique: true }));
    await queryRunner.createIndex('module_resources', new TableIndex({ name: 'idx_module_resources_module_id', columnNames: ['module_id'] }));
    await queryRunner.createIndex('module_resources', new TableIndex({ name: 'idx_module_resources_resource_id', columnNames: ['resource_id'] }));
    await queryRunner.createForeignKey('module_resources', new TableForeignKey({ name: 'fk_module_resources_module', columnNames: ['module_id'], referencedColumnNames: ['id'], referencedTableName: 'modules', onDelete: 'CASCADE', onUpdate: 'CASCADE' }));
    await queryRunner.createForeignKey('module_resources', new TableForeignKey({ name: 'fk_module_resources_resource', columnNames: ['resource_id'], referencedColumnNames: ['id'], referencedTableName: 'resources', onDelete: 'CASCADE', onUpdate: 'CASCADE' }));

    // ============================================================
    // Table: user_states
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'user_states',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'user_id', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'selected_condominium_id', type: 'uuid', isNullable: true },
          { name: 'theme', type: 'varchar', length: '20', default: "'system'", isNullable: false },
          { name: 'sidebar_collapsed', type: 'boolean', default: false, isNullable: false },
          { name: 'language', type: 'varchar', length: '10', default: "'es'", isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_by', type: 'uuid', isNullable: true },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'deleted_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('user_states', new TableIndex({ name: 'idx_user_states_user_id', columnNames: ['user_id'], isUnique: true }));
    await queryRunner.createForeignKey('user_states', new TableForeignKey({ name: 'fk_user_states_user', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    // ============================================================
    // Table: capability_presets
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'capability_presets',
        columns: [
          { name: 'id', type: 'varchar', length: '50', isPrimary: true },
          { name: 'label', type: 'varchar', length: '100', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'capabilities', type: 'jsonb', isNullable: false },
          { name: 'is_system', type: 'boolean', default: false, isNullable: false },
          { name: 'is_active', type: 'boolean', default: true, isNullable: false },
          { name: 'order', type: 'integer', default: 0, isNullable: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
        ],
      }),
      true,
    );

    // ============================================================
    // Seed: HTTP methods
    // ============================================================
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

    // ============================================================
    // Seed: Users module with permissions
    // ============================================================
    const [insertedModule] = await queryRunner.query(
      `INSERT INTO modules (code, name, description, is_active, icon, entity, endpoint, nav_config, actions_config, "order")
       VALUES ($1, $2, $3, true, 'Users', 'Usuario', '/api/admin/users',
         '{"path": "/admin/users", "order": 10}'::jsonb,
         '[
           {"code":"read","label":"Ver","description":"Ver lista de usuarios","httpMethod":"GET","uiConfig":{"component":"list","columns":[{"field":"email","label":"Email","sortable":true},{"field":"firstName","label":"Nombre","sortable":true},{"field":"lastName","label":"Apellido","sortable":true},{"field":"isActive","label":"Activo","format":"boolean"}],"filters":[{"field":"email","type":"text","label":"Email"},{"field":"isActive","type":"select","label":"Estado","options":[{"value":"true","label":"Activo"},{"value":"false","label":"Inactivo"}]}]}},
           {"code":"create","label":"Crear","description":"Crear nuevos usuarios","httpMethod":"POST","uiConfig":{"component":"form","fields":[{"name":"email","label":"Email","type":"email","required":true},{"name":"firstName","label":"Nombre","type":"text","required":true},{"name":"lastName","label":"Apellido","type":"text","required":true},{"name":"phone","label":"Telefono","type":"text"},{"name":"password","label":"Contraseña","type":"password","required":true}]}},
           {"code":"update","label":"Editar","description":"Editar usuarios","httpMethod":"PATCH","uiConfig":{"component":"form","fields":[{"name":"firstName","label":"Nombre","type":"text","required":true},{"name":"lastName","label":"Apellido","type":"text","required":true},{"name":"phone","label":"Telefono","type":"text"},{"name":"isActive","label":"Activo","type":"boolean"}]}},
           {"code":"delete","label":"Eliminar","description":"Eliminar usuarios del sistema","httpMethod":"DELETE","uiConfig":{"component":"confirm","message":"¿Esta seguro que desea eliminar este usuario?"}}
         ]'::jsonb,
         10)
       ON CONFLICT (code) DO UPDATE SET name = $2, description = $3
       RETURNING id`,
      ['users', 'Gestión de Usuarios', 'Administración de usuarios del sistema'],
    );

    const permissions = [
      { code: 'create', name: 'Crear usuarios', description: 'Crear nuevos usuarios en el sistema' },
      { code: 'read', name: 'Ver usuarios', description: 'Ver lista y detalle de usuarios' },
      { code: 'update', name: 'Editar usuarios', description: 'Modificar datos de usuarios' },
      { code: 'delete', name: 'Eliminar usuarios', description: 'Eliminar usuarios del sistema' },
    ];

    for (const permission of permissions) {
      await queryRunner.query(
        `INSERT INTO module_permissions (module_id, code, name, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (module_id, code) DO UPDATE SET name = $3, description = $4`,
        [insertedModule.id, permission.code, permission.name, permission.description],
      );
    }

    // ============================================================
    // Seed: Test users
    // ============================================================
    const passwordHash = await bcrypt.hash('Test123!', 12);

    await queryRunner.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name,
        is_super_admin, is_active, public_account_consent,
        consent_ip_address, consent_user_agent, consent_date, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, true, true, true,
        '127.0.0.1', 'Migration Seed', NOW(), NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['admin@test.com', passwordHash, 'Admin', 'Test'],
    );

    await queryRunner.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name,
        is_super_admin, is_active, public_account_consent,
        consent_ip_address, consent_user_agent, consent_date, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, false, true, true,
        '127.0.0.1', 'Migration Seed', NOW(), NOW(), NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['user@test.com', passwordHash, 'Usuario', 'Prueba'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse dependency order
    await queryRunner.dropTable('capability_presets', true);
    await queryRunner.dropTable('user_states', true);
    await queryRunner.dropTable('module_resources', true);
    await queryRunner.dropTable('resource_http_method_links', true);
    await queryRunner.dropTable('resource_http_methods', true);
    await queryRunner.dropTable('http_methods', true);
    await queryRunner.dropTable('resources', true);
    await queryRunner.dropTable('pool_permissions', true);
    await queryRunner.dropTable('user_pool_members', true);
    await queryRunner.dropTable('user_pools', true);
    await queryRunner.dropTable('user_permissions', true);
    await queryRunner.dropTable('module_permissions', true);
    await queryRunner.dropTable('modules', true);
    await queryRunner.dropTable('auth_logs', true);
    await queryRunner.dropTable('refresh_tokens', true);
    await queryRunner.dropTable('users', true);

    await queryRunner.query(`DROP TYPE IF EXISTS "auth_event_enum"`);
  }
}
