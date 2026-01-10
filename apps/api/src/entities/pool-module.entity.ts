import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';

import { Module } from './module.entity';
import { UserPool } from './user-pool.entity';

/**
 * Pool module access entity
 *
 * Represents a pool's access to a specific module.
 * All members of the pool inherit this module access.
 *
 * @example
 * ```typescript
 * const poolModule = new PoolModule();
 * poolModule.poolId = pool.id;
 * poolModule.moduleId = module.id;
 * poolModule.grantedBy = superAdmin.id;
 * poolModule.grantedAt = new Date();
 * ```
 */
@Entity('pool_modules')
@Index('idx_pool_modules_unique', ['poolId', 'moduleId'], { unique: true })
export class PoolModule extends BaseEntity {
  /**
   * ID of the pool
   */
  @Column({
    name: 'pool_id',
    type: 'uuid',
  })
  @Index('idx_pool_modules_pool_id')
  poolId!: string;

  /**
   * Pool with access
   */
  @ManyToOne(() => UserPool, (pool) => pool.modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool!: UserPool;

  /**
   * ID of the module being accessed
   */
  @Column({
    name: 'module_id',
    type: 'uuid',
  })
  @Index('idx_pool_modules_module_id')
  moduleId!: string;

  /**
   * Module being accessed
   */
  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module!: Module;

  /**
   * ID of the SuperAdmin who granted this access
   */
  @Column({
    name: 'granted_by',
    type: 'uuid',
  })
  grantedBy!: string;

  /**
   * Date when access was granted
   */
  @Column({
    name: 'granted_at',
    type: 'timestamptz',
  })
  grantedAt!: Date;
}
