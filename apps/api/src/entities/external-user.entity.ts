import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Integration } from './integration.entity';
import { ExternalPoolMember } from './external-pool-member.entity';
import { ExternalUserPermission } from './external-user-permission.entity';
import { ExternalUserResourceAccess } from './external-user-resource-access.entity';

/**
 * External user entity
 *
 * Represents a user from an external system (e.g. Captudata).
 * The externalId is the identifier used by the external system
 * (could be UUID, email, numeric ID, etc.).
 *
 * Scoped to a specific integration — the same external identifier
 * in two different integrations creates two separate ExternalUser records.
 */
@Entity('external_users')
@Index('idx_external_users_unique', ['externalId', 'integrationId'], { unique: true })
export class ExternalUser extends BaseEntity {
  /**
   * Identifier from the external system (UUID, email, numeric ID, etc.)
   */
  @Column({
    name: 'external_id',
    type: 'varchar',
    length: 255,
  })
  @Index('idx_external_users_external_id')
  externalId!: string;

  /**
   * ID of the integration this user belongs to
   */
  @Column({
    name: 'integration_id',
    type: 'uuid',
  })
  @Index('idx_external_users_integration_id')
  integrationId!: string;

  /**
   * Integration this user belongs to
   */
  @ManyToOne(() => Integration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'integration_id' })
  integration!: Integration;

  /**
   * Display name (optional, for admin reference)
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name?: string | null;

  /**
   * Email (optional, for admin reference)
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email?: string | null;

  /**
   * Organization code this user belongs to
   */
  @Column({
    name: 'organization_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  organizationCode?: string | null;

  /**
   * Client ID in the external system (e.g. Captudata client_id)
   */
  @Column({
    name: 'client_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  clientId?: string | null;

  /**
   * Client name in the external system
   */
  @Column({
    name: 'client_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  clientName?: string | null;

  /**
   * Whether this external user is active
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  /**
   * Pool memberships (reuses existing user_pools)
   */
  @OneToMany(() => ExternalPoolMember, (member) => member.externalUser)
  poolMemberships!: ExternalPoolMember[];

  /**
   * Direct module permissions
   */
  @OneToMany(() => ExternalUserPermission, (perm) => perm.externalUser)
  permissions!: ExternalUserPermission[];

  /**
   * Direct resource access grants
   */
  @OneToMany(() => ExternalUserResourceAccess, (access) => access.externalUser)
  resourceAccess!: ExternalUserResourceAccess[];
}
