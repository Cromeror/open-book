import { Entity, Column, Index, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { ResourceHttpMethod } from './resource-http-method.entity';

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
   * HTTP methods associated with this resource
   */
  @OneToMany(() => ResourceHttpMethod, (rhm) => rhm.resource)
  httpMethods!: ResourceHttpMethod[];
}
