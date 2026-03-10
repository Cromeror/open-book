import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';
import { UserPool } from './user-pool.entity';
import { Resource } from './resource.entity';
import { ResourceHttpMethod } from './resource-http-method.entity';
import type { ResponseFilter } from '../types/resource-access.types';

/**
 * Pool resource access entity
 *
 * Grants a pool (and all its members) access to a specific resource endpoint.
 * When resourceHttpMethodId is NULL, access is granted to all methods (wildcard).
 * When set, access is granted only to that specific HTTP method.
 *
 * Independent from module-level permissions (PoolPermission).
 *
 * @example
 * ```typescript
 * // Grant GET on goals resource to a pool
 * const access = new PoolResourceAccess();
 * access.poolId = pool.id;
 * access.resourceId = goalsResource.id;
 * access.resourceHttpMethodId = goalsGetMethod.id;
 * access.grantedBy = superAdmin.id;
 * access.grantedAt = new Date();
 *
 * // Grant ALL methods on goals resource (wildcard)
 * const wildcardAccess = new PoolResourceAccess();
 * wildcardAccess.poolId = pool.id;
 * wildcardAccess.resourceId = goalsResource.id;
 * wildcardAccess.resourceHttpMethodId = null; // wildcard
 * wildcardAccess.grantedBy = superAdmin.id;
 * wildcardAccess.grantedAt = new Date();
 * ```
 */
@Entity('pool_resource_access')
export class PoolResourceAccess extends BaseEntity {
  /**
   * ID of the pool receiving access
   */
  @Column({
    name: 'pool_id',
    type: 'uuid',
  })
  poolId!: string;

  /**
   * Pool receiving access
   */
  @ManyToOne(() => UserPool, (pool) => pool.resourceAccess, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pool_id' })
  pool!: UserPool;

  /**
   * ID of the resource being granted access to
   */
  @Column({
    name: 'resource_id',
    type: 'uuid',
  })
  resourceId!: string;

  /**
   * Resource being granted access to
   */
  @ManyToOne(() => Resource, (resource) => resource.poolAccess, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resource_id' })
  resource!: Resource;

  /**
   * ID of the specific ResourceHttpMethod being granted.
   * NULL means access to ALL methods of the resource (wildcard).
   */
  @Column({
    name: 'resource_http_method_id',
    type: 'uuid',
    nullable: true,
  })
  resourceHttpMethodId?: string | null;

  /**
   * Specific ResourceHttpMethod being granted.
   * NULL means wildcard (all methods).
   */
  @ManyToOne(() => ResourceHttpMethod, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'resource_http_method_id' })
  resourceHttpMethod?: ResourceHttpMethod | null;

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
   * Optional filter to restrict which items pool members can see in GET responses.
   * NULL means no filtering (members see all items).
   *
   * @example
   * // Only see items where code is "1", "2", or "3"
   * { field: "code", type: "include", values: ["1", "2", "3"] }
   *
   * // See all items except those where code is "4", "5", "6"
   * { field: "code", type: "exclude", values: ["4", "5", "6"] }
   */
  @Column({
    name: 'response_filter',
    type: 'jsonb',
    nullable: true,
  })
  responseFilter?: ResponseFilter | null;
}
