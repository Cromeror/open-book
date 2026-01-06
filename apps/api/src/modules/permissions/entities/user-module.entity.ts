import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';

import { Module } from './module.entity';

/**
 * User module access entity
 *
 * Represents a user's access to a specific module.
 * A user must have module access before any granular permissions can be granted.
 *
 * @example
 * ```typescript
 * const userModule = new UserModule();
 * userModule.userId = user.id;
 * userModule.moduleId = module.id;
 * userModule.grantedBy = superAdmin.id;
 * userModule.grantedAt = new Date();
 * ```
 */
@Entity('user_modules')
@Index('idx_user_modules_user_module', ['userId', 'moduleId'], { unique: true })
export class UserModule extends BaseEntity {
  /**
   * ID of the user with access
   */
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  @Index('idx_user_modules_user_id')
  userId!: string;

  /**
   * User with access
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * ID of the module being accessed
   */
  @Column({
    name: 'module_id',
    type: 'uuid',
  })
  @Index('idx_user_modules_module_id')
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

  /**
   * Optional expiration date for the access
   * NULL means no expiration
   */
  @Column({
    name: 'expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  expiresAt?: Date | null;

  /**
   * Whether this access is currently active
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;
}
