import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationInfoToExternalUsers1741306600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE external_users
      ADD COLUMN organization_code VARCHAR(50) NULL,
      ADD COLUMN client_id VARCHAR(255) NULL,
      ADD COLUMN client_name VARCHAR(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE external_users
      DROP COLUMN client_name,
      DROP COLUMN client_id,
      DROP COLUMN organization_code
    `);
  }
}
