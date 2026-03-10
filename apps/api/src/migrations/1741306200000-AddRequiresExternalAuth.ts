import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequiresExternalAuth1741306200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE resources
      ADD COLUMN requires_external_auth BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE resources
      DROP COLUMN requires_external_auth
    `);
  }
}
