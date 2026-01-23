import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { ResourceCapability } from '../types/resource.types';

/**
 * CapabilityPreset Entity
 *
 * Stores predefined capability templates for quick HATEOAS resource configuration.
 * Used in the frontend resource form to apply common capability patterns.
 *
 * @example
 * {
 *   id: 'crud',
 *   label: 'CRUD Completo',
 *   description: 'Operaciones de Create, Read, Update, Delete',
 *   capabilities: [
 *     { name: 'list', method: 'GET', urlPattern: '' },
 *     { name: 'get', method: 'GET', urlPattern: '/{id}' },
 *     { name: 'create', method: 'POST', urlPattern: '' },
 *     { name: 'update', method: 'PATCH', urlPattern: '/{id}' },
 *     { name: 'delete', method: 'DELETE', urlPattern: '/{id}' }
 *   ],
 *   isSystem: true,
 *   isActive: true,
 *   order: 1
 * }
 */
@Entity('capability_presets')
export class CapabilityPreset {
  /**
   * Unique identifier and code (e.g., 'crud', 'readOnly', 'custom')
   * Serves as both primary key and human-readable identifier
   */
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id!: string;

  /**
   * Display label (e.g., 'CRUD Completo', 'Solo Lectura')
   */
  @Column({ type: 'varchar', length: 100 })
  label!: string;

  /**
   * Description of what this preset includes
   */
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /**
   * Array of capabilities included in this preset
   * Stored as JSONB for flexibility
   */
  @Column({ type: 'jsonb' })
  capabilities!: ResourceCapability[];

  /**
   * Whether this is a system preset (cannot be deleted)
   */
  @Column({ type: 'boolean', default: false, name: 'is_system' })
  isSystem!: boolean;

  /**
   * Whether this preset is active
   */
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  /**
   * Display order for UI sorting
   */
  @Column({ type: 'integer', default: 0 })
  order!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
