import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedOrganizations1741306000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get the captudata integration ID
    const [integration] = await queryRunner.query(
      `SELECT id FROM integrations WHERE code = 'captudata' AND deleted_at IS NULL LIMIT 1`,
    );

    if (!integration) {
      throw new Error('CaptuData integration not found. Run previous migrations first.');
    }

    const integrationId = integration.id;

    await queryRunner.query(
      `INSERT INTO organizations (id, code, name, external_id, integration_id, is_active)
       VALUES
         (uuid_generate_v4(), 'bid', 'BID', '1', $1, true),
         (uuid_generate_v4(), 'ayuda-en-accion', 'Ayuda en Acción', '17', $1, true),
         (uuid_generate_v4(), 'minfra', 'Minfra', '21', $1, true)
       ON CONFLICT (code) DO NOTHING`,
      [integrationId],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM organizations WHERE code IN ('bid', 'ayuda-en-accion', 'minfra')`,
    );
  }
}
