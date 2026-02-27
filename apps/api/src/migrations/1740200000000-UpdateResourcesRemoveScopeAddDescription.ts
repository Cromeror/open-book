import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to remove the `scope` column from resources and add `description`.
 *
 * Scope was redundant — it can be inferred from the templateUrl
 * (contains 'condominiums/' → condominium, otherwise → global).
 *
 * Description is a free-text nullable field for documenting what a resource is.
 */
export class UpdateResourcesRemoveScopeAddDescription1740200000000 implements MigrationInterface {
  name = 'UpdateResourcesRemoveScopeAddDescription1740200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resources" DROP COLUMN "scope"`);
    await queryRunner.query(`ALTER TABLE "resources" ADD COLUMN "description" TEXT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resources" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "resources" ADD COLUMN "scope" VARCHAR(20) NOT NULL DEFAULT 'global'`);
  }
}
