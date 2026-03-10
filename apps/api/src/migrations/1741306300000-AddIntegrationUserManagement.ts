import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntegrationUserManagement1741306300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE integrations
      ADD COLUMN manages_users BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN internal_permissions BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE integrations
      DROP COLUMN internal_permissions,
      DROP COLUMN manages_users
    `);
  }
}
