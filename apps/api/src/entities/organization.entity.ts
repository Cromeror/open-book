import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Integration } from './integration.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  @Index('idx_organizations_code', { unique: true })
  code!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'external_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Index('idx_organizations_external_id')
  externalId?: string | null;

  @Column({
    name: 'integration_id',
    type: 'uuid',
    nullable: true,
  })
  integrationId?: string | null;

  @ManyToOne(() => Integration, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'integration_id' })
  integration?: Integration | null;

  /**
   * Encrypted credentials for external system authentication.
   * Stored as AES-256-GCM encrypted hex string.
   * Plaintext format: JSON string with { email, password } or similar.
   */
  @Column({
    name: 'encrypted_credentials',
    type: 'text',
    nullable: true,
  })
  encryptedCredentials?: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;
}
