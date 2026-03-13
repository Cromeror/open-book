import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUserPermissions1741306700000 implements MigrationInterface {
  name = 'SeedUserPermissions1741306700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get user@test.com ID
    const [user] = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['user@test.com'],
    );

    if (!user) {
      console.log('user@test.com not found, skipping permission seeding');
      return;
    }

    // Get admin@test.com ID (the one granting permissions)
    const [admin] = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['admin@test.com'],
    );

    if (!admin) {
      console.log('admin@test.com not found, skipping permission seeding');
      return;
    }

    // Get all module_permissions for the 'users' module
    const modulePermissions = await queryRunner.query(
      `SELECT mp.id FROM module_permissions mp
       INNER JOIN modules m ON m.id = mp.module_id
       WHERE m.code = $1`,
      ['users'],
    );

    if (modulePermissions.length === 0) {
      console.log('No permissions found for users module, skipping');
      return;
    }

    // Assign each permission to user@test.com
    for (const mp of modulePermissions) {
      await queryRunner.query(
        `INSERT INTO user_permissions (user_id, module_permission_id, granted_by, granted_at, is_active)
         VALUES ($1, $2, $3, NOW(), true)
         ON CONFLICT DO NOTHING`,
        [user.id, mp.id, admin.id],
      );
    }

    console.log(
      `Assigned ${modulePermissions.length} permissions (users module) to user@test.com`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [user] = await queryRunner.query(
      `SELECT id FROM users WHERE email = $1`,
      ['user@test.com'],
    );

    if (!user) return;

    await queryRunner.query(
      `DELETE FROM user_permissions
       WHERE user_id = $1
       AND module_permission_id IN (
         SELECT mp.id FROM module_permissions mp
         INNER JOIN modules m ON m.id = mp.module_id
         WHERE m.code = $2
       )`,
      [user.id, 'users'],
    );
  }
}
