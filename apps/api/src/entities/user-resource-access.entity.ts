import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';
import { User } from '../entities/user.entity';
import { Resource } from './resource.entity';
import { ResourceHttpMethod } from './resource-http-method.entity';
import type { ResponseFilter } from '../types/resource-access.types';

/**
 * User resource access entity
 *
 * Grants a user access to a specific resource endpoint.
 * When resourceHttpMethodId is NULL, access is granted to all methods (wildcard).
 * When set, access is granted only to that specific HTTP method.
 *
 * Independent from module-level permissions (UserPermission).
 *
 * @example
 * ```typescript
 * // Grant GET on goals resource
 * const access = new UserResourceAccess();
 * access.userId = user.id;
 * access.resourceId = goalsResource.id;
 * access.resourceHttpMethodId = goalsGetMethod.id;
 * access.grantedBy = superAdmin.id;
 * access.grantedAt = new Date();
 *
 * // Grant ALL methods on goals resource (wildcard)
 * const wildcardAccess = new UserResourceAccess();
 * wildcardAccess.userId = user.id;
 * wildcardAccess.resourceId = goalsResource.id;
 * wildcardAccess.resourceHttpMethodId = null; // wildcard
 * wildcardAccess.grantedBy = superAdmin.id;
 * wildcardAccess.grantedAt = new Date();
 * ```
 */
@Entity('user_resource_access')
export class UserResourceAccess extends BaseEntity {
  /**
   * ID of the user receiving access
   */
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  /**
   * User receiving access
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

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
  @ManyToOne(() => Resource, (resource) => resource.userAccess, {
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
   * Whether this access grant is currently active
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  /**
   * Optional filter to restrict which items the user can see in GET responses.
   * NULL means no filtering (user sees all items).
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
