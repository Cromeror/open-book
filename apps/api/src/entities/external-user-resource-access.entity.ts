import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from './base.entity';
import { ExternalUser } from './external-user.entity';
import { Resource } from './resource.entity';
import { ResourceHttpMethod } from './resource-http-method.entity';
import type { ResponseFilter } from '../types/resource-access.types';

/**
 * External user resource access entity
 *
 * Grants an external user access to a specific resource endpoint.
 * When resourceHttpMethodId is NULL, access is granted to all methods (wildcard).
 */
@Entity('external_user_resource_access')
export class ExternalUserResourceAccess extends BaseEntity {
  /**
   * ID of the external user
   */
  @Column({
    name: 'external_user_id',
    type: 'uuid',
  })
  @Index('idx_ext_user_resource_access_external_user_id')
  externalUserId!: string;

  /**
   * External user this access belongs to
   */
  @ManyToOne(() => ExternalUser, (user) => user.resourceAccess, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'external_user_id' })
  externalUser!: ExternalUser;

  /**
   * ID of the resource being granted access to
   */
  @Column({
    name: 'resource_id',
    type: 'uuid',
  })
  @Index('idx_ext_user_resource_access_resource_id')
  resourceId!: string;

  /**
   * Resource being granted access to
   */
  @ManyToOne(() => Resource, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource!: Resource;

  /**
   * ID of the specific ResourceHttpMethod being granted.
   * NULL means access to ALL methods (wildcard).
   */
  @Column({
    name: 'resource_http_method_id',
    type: 'uuid',
    nullable: true,
  })
  resourceHttpMethodId?: string | null;

  /**
   * Specific ResourceHttpMethod being granted.
   */
  @ManyToOne(() => ResourceHttpMethod, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'resource_http_method_id' })
  resourceHttpMethod?: ResourceHttpMethod | null;

  /**
   * ID of the admin who granted this access
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
   * Optional expiration date
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
   * Optional filter to restrict visible items in GET responses
   */
  @Column({
    name: 'response_filter',
    type: 'jsonb',
    nullable: true,
  })
  responseFilter?: ResponseFilter | null;
}
