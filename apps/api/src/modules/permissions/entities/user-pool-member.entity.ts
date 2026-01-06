import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../../entities/base.entity';
import { User } from '../../../entities/user.entity';

import { UserPool } from './user-pool.entity';

/**
 * User pool member entity
 *
 * Represents a user's membership in a pool.
 * Members inherit all module access and permissions from the pool.
 *
 * @example
 * ```typescript
 * const member = new UserPoolMember();
 * member.poolId = pool.id;
 * member.userId = user.id;
 * member.addedBy = superAdmin.id;
 * member.addedAt = new Date();
 * ```
 */
@Entity('user_pool_members')
@Index('idx_user_pool_members_unique', ['poolId', 'userId'], { unique: true })
export class UserPoolMember extends BaseEntity {
  /**
   * ID of the pool
   */
  @Column({
    name: 'pool_id',
    type: 'uuid',
  })
  @Index('idx_user_pool_members_pool_id')
  poolId!: string;

  /**
   * Pool this membership belongs to
   */
  @ManyToOne(() => UserPool, (pool) => pool.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool!: UserPool;

  /**
   * ID of the member user
   */
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  @Index('idx_user_pool_members_user_id')
  userId!: string;

  /**
   * Member user
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * ID of the SuperAdmin who added this member
   */
  @Column({
    name: 'added_by',
    type: 'uuid',
  })
  addedBy!: string;

  /**
   * Date when the member was added to the pool
   */
  @Column({
    name: 'added_at',
    type: 'timestamptz',
  })
  addedAt!: Date;
}
