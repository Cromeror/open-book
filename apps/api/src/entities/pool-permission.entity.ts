import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';
import { Scope } from '../types/permissions.enum';
import { ModulePermission } from './module-permission.entity';
import { UserPool } from './user-pool.entity';

/**
 * Pool permission entity
 *
 * Represents a granular permission granted to a pool.
 * All members of the pool inherit this permission.
 * Requires that the pool has access to the parent module (via PoolModule).
 *
 * @example
 * ```typescript
 * const poolPermission = new PoolPermission();
 * poolPermission.poolId = pool.id;
 * poolPermission.modulePermissionId = permission.id;
 * poolPermission.scope = Scope.COPROPIEDAD;
 * poolPermission.scopeId = copropiedad.id;
 * poolPermission.grantedBy = superAdmin.id;
 * poolPermission.grantedAt = new Date();
 * ```
 */
@Entity('pool_permissions')
@Index(
  'idx_pool_permissions_unique',
  ['poolId', 'modulePermissionId', 'scope', 'scopeId'],
  { unique: true },
)
export class PoolPermission extends BaseEntity {
  /**
   * ID of the pool
   */
  @Column({
    name: 'pool_id',
    type: 'uuid',
  })
  @Index('idx_pool_permissions_pool_id')
  poolId!: string;

  /**
   * Pool with the permission
   */
  @ManyToOne(() => UserPool, (pool) => pool.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool!: UserPool;

  /**
   * ID of the module permission being granted
   */
  @Column({
    name: 'module_permission_id',
    type: 'uuid',
  })
  @Index('idx_pool_permissions_module_permission_id')
  modulePermissionId!: string;

  /**
   * Module permission being granted
   */
  @ManyToOne(() => ModulePermission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_permission_id' })
  modulePermission!: ModulePermission;

  /**
   * Scope of the permission
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: Scope.OWN,
  })
  scope!: Scope;

  /**
   * ID of the scoped entity (e.g., copropiedad ID when scope is COPROPIEDAD)
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
}
