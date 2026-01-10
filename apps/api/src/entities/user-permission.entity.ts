import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';
import { User } from '../entities/user.entity';
import { Scope } from '../types/permissions.enum';

import { ModulePermission } from './module-permission.entity';

/**
 * User permission entity
 *
 * Represents a granular permission granted to a user within a module.
 * Requires that the user has access to the parent module (via UserModule).
 *
 * @example
 * ```typescript
 * const userPermission = new UserPermission();
 * userPermission.userId = user.id;
 * userPermission.modulePermissionId = permission.id;
 * userPermission.scope = Scope.COPROPIEDAD;
 * userPermission.scopeId = copropiedad.id;
 * userPermission.grantedBy = superAdmin.id;
 * userPermission.grantedAt = new Date();
 * ```
 */
@Entity('user_permissions')
@Index(
  'idx_user_permissions_unique',
  ['userId', 'modulePermissionId', 'scope', 'scopeId'],
  { unique: true },
)
export class UserPermission extends BaseEntity {
  /**
   * ID of the user with the permission
   */
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  @Index('idx_user_permissions_user_id')
  userId!: string;

  /**
   * User with the permission
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * ID of the module permission being granted
   */
  @Column({
    name: 'module_permission_id',
    type: 'uuid',
  })
  @Index('idx_user_permissions_module_permission_id')
  modulePermissionId!: string;

  /**
   * Module permission being granted
   */
  @ManyToOne(() => ModulePermission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_permission_id' })
  modulePermission!: ModulePermission;

  /**
   * Scope of the permission
   * - OWN: Only own resources
   * - COPROPIEDAD: Resources within a specific copropiedad
   * - ALL: All resources (SuperAdmin only)
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: Scope.OWN,
  })
  scope!: Scope;

  /**
   * ID of the scoped entity (e.g., copropiedad ID when scope is COPROPIEDAD)
   * NULL for OWN and ALL scopes
   */
  @Column({
    name: 'scope_id',
    type: 'uuid',
    nullable: true,
  })
  scopeId?: string | null;

  /**
   * ID of the SuperAdmin who granted this permission
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
   * Optional expiration date for the permission
   * NULL means no expiration
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
