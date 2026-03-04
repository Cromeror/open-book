import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from './base.entity';
import { Module } from './module.entity';
import { Resource } from './resource.entity';

/**
 * Join table for the many-to-many relationship between modules and resources.
 *
 * A module can be associated with multiple resources (e.g., a module that
 * lists goals and navigates to their details uses both the `goals` and
 * `goal-detail` resources). Conversely, a resource can be consumed by
 * multiple modules.
 *
 * This association drives action inference: the HTTP methods configured on
 * the associated resources suggest which CRUD actions the module supports.
 */
@Entity('module_resources')
@Index('idx_module_resources_unique', ['moduleId', 'resourceId'], { unique: true })
export class ModuleResource extends BaseEntity {
  @Column({ name: 'module_id', type: 'uuid' })
  @Index('idx_module_resources_module_id')
  moduleId!: string;

  @ManyToOne(() => Module, (module) => module.resources, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module!: Module;

  @Column({ name: 'resource_id', type: 'uuid' })
  @Index('idx_module_resources_resource_id')
  resourceId!: string;

  @ManyToOne(() => Resource, (resource) => resource.modules, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'resource_id' })
  resource!: Resource;

  /**
   * Optional label to describe the role of this resource within the module.
   * Examples: 'primary', 'detail', 'related'
   */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  role?: string;
}
