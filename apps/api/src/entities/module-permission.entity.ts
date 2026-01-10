import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';

import { Module } from './module.entity';

/**
 * Module permission entity
 *
 * Represents a specific permission/action available within a module.
 * Permissions are registered via migrations along with their parent module.
 *
 * @example
 * ```typescript
 * const permission = new ModulePermission();
 * permission.moduleId = module.id;
 * permission.code = 'create';
 * permission.name = 'Crear objetivos';
 * permission.description = 'Permite crear nuevos objetivos de recaudo';
 * ```
 */
@Entity('module_permissions')
@Index('idx_module_permissions_module_code', ['moduleId', 'code'], {
  unique: true,
})
export class ModulePermission extends BaseEntity {
  /**
   * ID of the parent module
   */
  @Column({
    name: 'module_id',
    type: 'uuid',
  })
  @Index('idx_module_permissions_module_id')
  moduleId!: string;

  /**
   * Parent module
   */
  @ManyToOne(() => Module, (module) => module.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module!: Module;

  /**
   * Permission code (e.g., 'create', 'read', 'update', 'delete')
   */
  @Column({
    type: 'varchar',
    length: 50,
  })
  code!: string;

  /**
   * Display name of the permission
   */
  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  /**
   * Description of what this permission allows
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;
}
