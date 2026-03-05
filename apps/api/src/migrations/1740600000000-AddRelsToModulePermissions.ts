import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add `rels` column to `module_permissions`.
 *
 * Stores a comma-separated list of HATEOAS link `rel` values that this
 * permission enables (e.g. "self,edit,delete").
 * NULL means the permission imposes no link-level restriction.
 */
export class AddRelsToModulePermissions1740600000000 implements MigrationInterface {
  name = 'AddRelsToModulePermissions1740600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "module_permissions" ADD COLUMN "rels" varchar(500) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "module_permissions" DROP COLUMN "rels"`,
    );
  }
}
