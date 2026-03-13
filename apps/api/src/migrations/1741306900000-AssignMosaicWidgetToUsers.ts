import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignMosaicWidgetToUsers1741306900000 implements MigrationInterface {
  name = 'AssignMosaicWidgetToUsers1741306900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE modules SET
        component = 'MosaicWidget',
        component_config = '${JSON.stringify({
          items: [
            { id: 'total', title: 'Total Usuarios', value: '—', icon: 'Users', variant: 'primary' },
            { id: 'active', title: 'Activos', value: '—', icon: 'UserCheck', variant: 'success' },
            { id: 'inactive', title: 'Inactivos', value: '—', icon: 'UserX', variant: 'danger' },
            { id: 'new', title: 'Nuevos (30d)', value: '—', icon: 'UserPlus', variant: 'warning' },
          ],
          columns: { xs: 1, sm: 2, md: 4 },
          gap: 'md',
        })}'::jsonb
      WHERE code = 'users'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE modules SET
        component = NULL,
        component_config = NULL
      WHERE code = 'users'
    `);
  }
}
