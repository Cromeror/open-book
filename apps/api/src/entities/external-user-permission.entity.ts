import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from './base.entity';
import { ExternalUser } from './external-user.entity';
import { ModulePermission } from './module-permission.entity';

/**
 * External user permission entity
 *
 * Grants a module permission to an external user.
 * Mirrors UserPermission but references ExternalUser instead of User.
 * Module access is inferred from having at least one permission for that module.
 */
@Entity('external_user_permissions')
@Index(
  'idx_ext_user_permissions_unique',
  ['externalUserId', 'modulePermissionId'],
  { unique: true },
)
export class ExternalUserPermission extends BaseEntity {
  /**
   * ID of the external user
   */
  @Column({
    name: 'external_user_id',
    type: 'uuid',
  })
  @Index('idx_ext_user_permissions_external_user_id')
  externalUserId!: string;

  /**
   * External user this permission belongs to
   */
  @ManyToOne(() => ExternalUser, (user) => user.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'external_user_id' })
  externalUser!: ExternalUser;

  /**
   * ID of the module permission being granted
   */
  @Column({
    name: 'module_permission_id',
    type: 'uuid',
  })
  @Index('idx_ext_user_permissions_module_permission_id')
  modulePermissionId!: string;

  /**
   * Module permission being granted
   */
  @ManyToOne(() => ModulePermission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_permission_id' })
  modulePermission!: ModulePermission;

  /**
   * ID of the admin who granted this permission
   */
  @Column({
    name: 'granted_by',
    type: 'uuid',
  })
  grantedBy!: string;

  /**
   * Date when permission was granted
   */
  @Column({
    name: 'granted_at',
    type: 'timestamptz',
  })
  grantedAt!: Date;

  /**
   * Optional expiration date
   */
  @Column({
    name: 'expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  expiresAt?: Date | null;

  /**
   * Whether this permission is currently active
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;
}
