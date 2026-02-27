import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

import { BaseEntity } from './base.entity';
import { ResourceHttpMethod } from './resource-http-method.entity';

/**
 * Maps a response field (dot notation) to a URL placeholder in the target template URL.
 *
 * @example
 * { responseField: 'id', urlParam: 'goalId' }
 * → takes `item.id` and injects it as `{goalId}` in the target template URL
 */
export interface ParamMapping {
  /** Field path in the source response item (dot notation, e.g., 'id', 'condominium.id') */
  responseField: string;
  /** Placeholder name in the target templateUrl (e.g., 'goalId') */
  urlParam: string;
}

/**
 * ResourceHttpMethodLink entity
 *
 * Configures HATEOAS links between two ResourceHttpMethod entries.
 * When a user calls the source endpoint, each response item will include
 * a `_links` array with resolved URLs for each active link.
 *
 * sessionContext parameters (e.g., {condominiumId}) are resolved automatically.
 * Only item-specific params need to be declared in paramMappings.
 *
 * @example
 * sourceHttpMethod: goals:list (GET /api/condominiums/{condominiumId}/goals)
 * targetHttpMethod: goals:get  (GET /api/condominiums/{condominiumId}/goals/{goalId})
 * rel: 'self'
 * paramMappings: [{ responseField: 'id', urlParam: 'goalId' }]
 */
@Entity('resource_http_method_links')
@Index('idx_resource_http_method_links_source', ['sourceHttpMethodId'])
@Index('idx_resource_http_method_links_target', ['targetHttpMethodId'])
export class ResourceHttpMethodLink extends BaseEntity {
  /**
   * Foreign key to the source ResourceHttpMethod (the one returning the list/item)
   */
  @Column({ name: 'source_http_method_id', type: 'uuid' })
  sourceHttpMethodId!: string;

  /**
   * The source ResourceHttpMethod entity
   */
  @ManyToOne(() => ResourceHttpMethod, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'source_http_method_id' })
  sourceHttpMethod!: ResourceHttpMethod;

  /**
   * Foreign key to the target ResourceHttpMethod (the linked action)
   */
  @Column({ name: 'target_http_method_id', type: 'uuid' })
  targetHttpMethodId!: string;

  /**
   * The target ResourceHttpMethod entity
   */
  @ManyToOne(() => ResourceHttpMethod, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'target_http_method_id' })
  targetHttpMethod!: ResourceHttpMethod;

  /**
   * Link relation name (e.g., 'self', 'detail', 'delete', 'update')
   */
  @Column({ name: 'rel', type: 'varchar', length: 64 })
  rel!: string;

  /**
   * Mappings from response fields to URL placeholders.
   *
   * Declares which fields from the item's response should fill
   * which placeholders in the target's templateUrl.
   * sessionContext placeholders (e.g., {condominiumId}) are resolved automatically.
   */
  @Column({
    name: 'param_mappings',
    type: 'jsonb',
    default: '[]',
  })
  paramMappings!: ParamMapping[];

  /**
   * Whether this link configuration is active
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;
}
