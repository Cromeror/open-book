import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddModuleTagsColumn1736369000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'modules',
      new TableColumn({
        name: 'tags',
        type: 'jsonb',
        default: "'[]'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('modules', 'tags');
  }
}
