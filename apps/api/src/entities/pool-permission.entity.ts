import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';
import { ModulePermission } from './module-permission.entity';
import { UserPool } from './user-pool.entity';

/**
 * Pool permission entity
 *
 * Represents a granular permission granted to a pool.
 * All members of the pool inherit this permission.
 * Module access is inferred from having at least one permission for that module.
 *
 * @example
 * ```typescript
 * const poolPermission = new PoolPermission();
 * poolPermission.poolId = pool.id;
 * poolPermission.modulePermissionId = permission.id;
 * poolPermission.grantedBy = superAdmin.id;
 * poolPermission.grantedAt = new Date();
 * ```
 */
@Entity('pool_permissions')
@Index(
  'idx_pool_permissions_unique',
  ['poolId', 'modulePermissionId'],
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
