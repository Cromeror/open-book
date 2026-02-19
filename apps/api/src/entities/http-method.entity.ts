import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

/**
 * HttpMethod entity
 *
 * Stores standard REST HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
 * Used as a catalog for resource-method associations in the
 * resource_http_methods junction table.
 */
@Entity('http_methods')
export class HttpMethod extends BaseEntity {
  /**
   * HTTP method verb (e.g., GET, POST, PUT, PATCH, DELETE)
   */
  @Column({
    type: 'varchar',
    length: 10,
    unique: true,
  })
  @Index('idx_http_methods_method', { unique: true })
  method!: string;

  /**
   * Description of the HTTP method purpose
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description?: string;
}
