import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Migration to add metadata columns to modules table
 *
 * Adds columns for:
 * - icon: Lucide icon name
 * - type: 'crud' or 'specialized'
 * - entity: Entity name for CRUD modules
 * - endpoint: API endpoint for CRUD modules
 * - component: Component name for specialized modules
 * - nav_config: Navigation configuration (path, order)
 * - actions_config: Actions configuration with settings
 * - order: Display order in navigation
 */
export class AddModuleMetadataColumns1736165000000 implements MigrationInterface {
  name = 'AddModuleMetadataColumns1736165000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add icon column
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'icon',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    // Add type column with default 'crud'
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        length: '20',
        default: "'crud'",
      }),
    );

    // Add entity column (for CRUD modules)
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'entity',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    // Add endpoint column (for CRUD modules)
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'endpoint',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // Add component column (for specialized modules)
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'component',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    // Add nav_config column (JSONB)
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'nav_config',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Add actions_config column (JSONB)
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'actions_config',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Add order column
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'order',
        type: 'integer',
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('modules', 'order');
    await queryRunner.dropColumn('modules', 'actions_config');
    await queryRunner.dropColumn('modules', 'nav_config');
    await queryRunner.dropColumn('modules', 'component');
    await queryRunner.dropColumn('modules', 'endpoint');
    await queryRunner.dropColumn('modules', 'entity');
    await queryRunner.dropColumn('modules', 'type');
    await queryRunner.dropColumn('modules', 'icon');
  }
}
