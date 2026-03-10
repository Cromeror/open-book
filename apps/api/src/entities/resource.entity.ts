import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from './base.entity';
import { ResourceHttpMethod } from './resource-http-method.entity';
import { ModuleResource } from './module-resource.entity';
import { Integration } from './integration.entity';
import { UserResourceAccess } from './user-resource-access.entity';
import { PoolResourceAccess } from './pool-resource-access.entity';

/**
 * Resource entity for API gateway configuration
 *
 * Represents a REST resource in the system. Resources are configured by
 * superadmins and consumed by the proxy (via gRPC). Each resource can be
 * associated with multiple HTTP methods through the resource_http_methods
 * junction table.
 *
 * @example
 * ```typescript
 * const resource = new Resource();
 * resource.code = 'goals';
 * resource.name = 'Objetivos de Recaudo';
 * resource.templateUrl = '/api/condominiums/{condominiumId}/goals';
 * ```
 */
@Entity('resources')
export class Resource extends BaseEntity {
  /**
   * Unique code identifier for the resource
   */
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  @Index('idx_resources_code', { unique: true })
  code!: string;

  /**
   * Display name of the resource
   */
  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  /**
   * Optional description for documentation purposes
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  /**
   * URL template for the resource
   * Can include placeholders like {condominiumId}
   */
  @Column({
    name: 'template_url',
    type: 'varchar',
    length: 255,
  })
  templateUrl!: string;

  /**
   * Whether the resource is active
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  /**
   * Whether this resource requires permission/role checks for external users.
   * Only relevant when the resource is backed by an external integration.
   */
  @Column({
    name: 'requires_external_auth',
    type: 'boolean',
    default: false,
  })
  requiresExternalAuth!: boolean;

  /**
   * Optional integration this resource is backed by.
   * When set, templateUrl is relative to the integration's baseUrl.
   * When null, the resource uses the local API base.
   */
  @Column({
    name: 'integration_id',
    type: 'uuid',
    nullable: true,
  })
  integrationId?: string | null;

  @ManyToOne(() => Integration, { nullable: true })
  @JoinColumn({ name: 'integration_id' })
  integration?: Integration | null;

  /**
   * HTTP methods associated with this resource
   */
  @OneToMany(() => ResourceHttpMethod, (rhm) => rhm.resource)
  httpMethods!: ResourceHttpMethod[];

  /**
   * Modules that reference this resource
   */
  @OneToMany(() => ModuleResource, (mr) => mr.resource)
  modules!: ModuleResource[];

  /**
   * Direct user access grants for this resource
   */
  @OneToMany(() => UserResourceAccess, (ura) => ura.resource)
  userAccess!: UserResourceAccess[];

  /**
   * Pool access grants for this resource
   */
  @OneToMany(() => PoolResourceAccess, (pra) => pra.resource)
  poolAccess!: PoolResourceAccess[];
}
