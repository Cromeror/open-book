import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';
import {
  ResourceCapability,
  ResourceScope,
} from '../types/resource.types';

/**
 * Resource entity for HATEOAS configuration
 *
 * Represents a REST resource in the system with its available capabilities.
 * Resources are configured by superadmins and consumed by the proxy (via gRPC)
 * to inject HATEOAS links into API responses.
 *
 * Key design: Unified capability model
 * - All capabilities are treated equally (no custom vs standard distinction)
 * - Capabilities define name, method, urlPattern, and optional permission
 * - The proxy generates HATEOAS links from capabilities at runtime
 *
 * @example
 * ```typescript
 * const resource = new Resource();
 * resource.code = 'goals';
 * resource.name = 'Objetivos de Recaudo';
 * resource.scope = 'condominium';
 * resource.baseUrl = '/api/condominiums/{condominiumId}/goals';
 * resource.capabilities = [
 *   { name: 'list', method: 'GET', urlPattern: '' },
 *   { name: 'get', method: 'GET', urlPattern: '/{id}' },
 *   { name: 'create', method: 'POST', urlPattern: '' },
 *   { name: 'close', method: 'POST', urlPattern: '/{id}/close' },
 * ];
 * ```
 */
@Entity('resources')
export class Resource extends BaseEntity {
  /**
   * Unique code identifier for the resource
   * Used to reference the resource in the system
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
   * Resource scope: 'global' or 'condominium'
   * - global: Resource is not scoped to a condominium (e.g., /api/users)
   * - condominium: Resource is scoped to a condominium (e.g., /api/condominiums/{id}/goals)
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'global',
  })
  scope!: ResourceScope;

  /**
   * Base URL template for the resource
   * Can include placeholders like {condominiumId}
   */
  @Column({
    name: 'base_url',
    type: 'varchar',
    length: 255,
  })
  baseUrl!: string;

  /**
   * Resource capabilities - actions available on this resource
   *
   * Each capability defines:
   * - name: Capability identifier (e.g., 'list', 'create', 'close')
   * - method: HTTP method (GET, POST, etc.)
   * - urlPattern: Pattern appended to baseUrl (e.g., '', '/{id}', '/{id}/close')
   * - permission: Optional permission code (defaults to '{code}:{name}')
   *
   * The proxy uses these capabilities to generate HATEOAS links at runtime.
   */
  @Column({
    type: 'jsonb',
    default: [],
  })
  capabilities!: ResourceCapability[];

  /**
   * Whether the resource is active
   * Inactive resources are not included in HATEOAS responses
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;
}
