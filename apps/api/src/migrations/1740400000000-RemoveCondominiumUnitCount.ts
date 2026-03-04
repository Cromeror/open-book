import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to remove the deprecated `unit_count` column from condominiums.
 *
 * This field was replaced by counting actual properties linked to the condominium.
 */
export class RemoveCondominiumUnitCount1740400000000 implements MigrationInterface {
  name = 'RemoveCondominiumUnitCount1740400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "condominiums" DROP COLUMN "unit_count"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "condominiums" ADD COLUMN "unit_count" INTEGER NOT NULL DEFAULT 0`);
  }
}
