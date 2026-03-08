import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * Adds optional integration_id FK to resources table.
 * When set, the resource's templateUrl is relative to the integration's baseUrl.
 */
export class AddIntegrationIdToResources1741305700000 implements MigrationInterface {
  name = 'AddIntegrationIdToResources1741305700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'resources',
      new TableColumn({
        name: 'integration_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'resources',
      new TableIndex({
        name: 'idx_resources_integration_id',
        columnNames: ['integration_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'resources',
      new TableForeignKey({
        name: 'fk_resources_integration',
        columnNames: ['integration_id'],
        referencedTableName: 'integrations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('resources', 'fk_resources_integration');
    await queryRunner.dropIndex('resources', 'idx_resources_integration_id');
    await queryRunner.dropColumn('resources', 'integration_id');
  }
}
