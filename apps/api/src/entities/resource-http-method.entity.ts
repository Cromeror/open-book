import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Resource } from './resource.entity';
import { HttpMethod } from './http-method.entity';
import type {
  PayloadMetadata,
  ResponseMetadata,
} from '../types/resource-metadata.types';

/**
 * ResourceHttpMethod entity (junction table)
 *
 * Creates a many-to-many relationship between resources and HTTP methods.
 * Each combination stores metadata about the expected request payload
 * and successful response structure.
 *
 * @example
 * ```typescript
 * const rhm = new ResourceHttpMethod();
 * rhm.resource = goalsResource;
 * rhm.httpMethod = getMethod;
 * rhm.payloadMetadata = {
 *   method: 'GET',
 *   summary: 'List goals',
 *   parameters: [
 *     { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } }
 *   ]
 * };
 * rhm.responseMetadata = {
 *   method: 'GET',
 *   success: { statusCode: 200, contentType: 'application/json', schema: { type: 'object' } }
 * };
 * ```
 */
@Entity('resource_http_methods')
@Index('idx_resource_http_methods_unique', ['resourceId', 'httpMethodId'], {
  unique: true,
})
export class ResourceHttpMethod extends BaseEntity {
  /**
   * Foreign key to resources table
   */
  @Column({ name: 'resource_id', type: 'uuid' })
  @Index('idx_resource_http_methods_resource_id')
  resourceId!: string;

  /**
   * Related resource entity
   */
  @ManyToOne(() => Resource, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource!: Resource;

  /**
   * Foreign key to http_methods table
   */
  @Column({ name: 'http_method_id', type: 'uuid' })
  @Index('idx_resource_http_methods_http_method_id')
  httpMethodId!: string;

  /**
   * Related HTTP method entity
   */
  @ManyToOne(() => HttpMethod, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'http_method_id' })
  httpMethod!: HttpMethod;

  /**
   * Metadata describing the expected request payload
   *
   * Includes parameters (path, query, header) and request body schema.
   * NULL means no metadata defined (no validation).
   *
   * @see PayloadMetadata
   */
  @Column({
    name: 'payload_metadata',
    type: 'jsonb',
    nullable: true,
  })
  payloadMetadata?: PayloadMetadata;

  /**
   * Metadata describing the successful response structure
   *
   * Includes status code, response body schema, and headers.
   * NULL means no metadata defined.
   *
   * @see ResponseMetadata
   */
  @Column({
    name: 'response_metadata',
    type: 'jsonb',
    nullable: true,
  })
  responseMetadata?: ResponseMetadata;

  /**
   * Whether this resource-method association is active
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;
}
