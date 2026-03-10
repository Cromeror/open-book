import { MigrationInterface, QueryRunner } from 'typeorm';
import { encrypt } from '../common/crypto';

export class AddOrganizationCredentials1741306100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add encrypted_credentials column
    await queryRunner.query(
      `ALTER TABLE organizations ADD COLUMN IF NOT EXISTS encrypted_credentials TEXT`,
    );

    // Seed BID credentials (encrypted)
    const credentials = JSON.stringify({
      email: 'admin@client1.com',
      password: 'Ih4ve50m3pow3r!',
    });
    const encrypted = encrypt(credentials);

    await queryRunner.query(
      `UPDATE organizations SET encrypted_credentials = $1 WHERE code = 'bid'`,
      [encrypted],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE organizations DROP COLUMN IF EXISTS encrypted_credentials`,
    );
  }
}
