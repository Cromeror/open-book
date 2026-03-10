import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from './base.entity';
import { ExternalUser } from './external-user.entity';
import { UserPool } from './user-pool.entity';

/**
 * External pool member entity
 *
 * Links an external user to an existing UserPool.
 * External users inherit pool_permissions and pool_resource_access
 * from the same pools that internal users use.
 */
@Entity('external_pool_members')
@Index('idx_ext_pool_members_unique', ['externalUserId', 'poolId'], { unique: true })
export class ExternalPoolMember extends BaseEntity {
  /**
   * ID of the external user
   */
  @Column({
    name: 'external_user_id',
    type: 'uuid',
  })
  @Index('idx_ext_pool_members_external_user_id')
  externalUserId!: string;

  /**
   * External user
   */
  @ManyToOne(() => ExternalUser, (user) => user.poolMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'external_user_id' })
  externalUser!: ExternalUser;

  /**
   * ID of the pool (reuses existing user_pools table)
   */
  @Column({
    name: 'pool_id',
    type: 'uuid',
  })
  @Index('idx_ext_pool_members_pool_id')
  poolId!: string;

  /**
   * Pool this membership belongs to
   */
  @ManyToOne(() => UserPool, (pool) => pool.externalMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool!: UserPool;

  /**
   * ID of the admin who added this member
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
