import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { PoolModule } from './pool-module.entity';
import { PoolPermission } from './pool-permission.entity';
import { UserPoolMember } from './user-pool-member.entity';

/**
 * User pool entity
 *
 * Represents a group of users with shared permissions.
 * Pools allow SuperAdmin to manage permissions for multiple users at once.
 *
 * @example
 * ```typescript
 * const pool = new UserPool();
 * pool.name = 'Administradores Edificio Centro';
 * pool.description = 'Administradores del edificio Centro';
 * pool.createdBy = superAdmin.id;
 * ```
 */
@Entity('user_pools')
export class UserPool extends BaseEntity {
  /**
   * Display name of the pool
   */
  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  /**
   * Description of the pool's purpose
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  /**
   * Whether the pool is active
   * Inactive pools don't grant permissions to members
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  /**
   * Members of this pool
   */
  @OneToMany(() => UserPoolMember, (member) => member.pool)
  members!: UserPoolMember[];

  /**
   * Modules accessible by pool members
   */
  @OneToMany(() => PoolModule, (pm) => pm.pool)
  modules!: PoolModule[];

  /**
   * Granular permissions granted to pool members
   */
  @OneToMany(() => PoolPermission, (pp) => pp.pool)
  permissions!: PoolPermission[];
}
