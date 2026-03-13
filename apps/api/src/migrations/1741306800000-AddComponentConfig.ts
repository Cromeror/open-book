import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComponentConfig1741306800000 implements MigrationInterface {
  name = 'AddComponentConfig1741306800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "modules"
      ADD COLUMN "component_config" jsonb DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "modules"
      DROP COLUMN "component_config"
    `);
  }
}
