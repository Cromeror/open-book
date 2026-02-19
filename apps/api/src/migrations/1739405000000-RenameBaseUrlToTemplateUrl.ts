import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to rename base_url column to template_url in the resources table
 */
export class RenameBaseUrlToTemplateUrl1739405000000
  implements MigrationInterface
{
  name = 'RenameBaseUrlToTemplateUrl1739405000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('resources', 'base_url', 'template_url');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('resources', 'template_url', 'base_url');
  }
}
