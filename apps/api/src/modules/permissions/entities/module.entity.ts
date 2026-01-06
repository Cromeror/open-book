import { Entity, Column, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../entities/base.entity';

import { ModulePermission } from './module-permission.entity';

/**
 * System module entity
 *
 * Represents a functional module in the system (e.g., 'objetivos', 'aportes', 'pqr').
 * Modules are registered via migrations and contain permissions that can be granted to users.
 *
 * @example
 * ```typescript
 * const module = new Module();
 * module.code = 'objetivos';
 * module.name = 'Objetivos de Recaudo';
 * module.description = 'Gestión de metas de recaudo';
 * ```
 */
@Entity('modules')
export class Module extends BaseEntity {
  /**
   * Unique code identifier for the module
   * Used in permission strings (e.g., 'objetivos:create')
   */
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  @Index('idx_modules_code', { unique: true })
  code!: string;

  /**
   * Display name of the module
   */
  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  /**
   * Description of the module's purpose
   */
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  /**
   * Whether the module is active
   * Inactive modules cannot have permissions granted
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  /**
   * Permissions available in this module
   */
  @OneToMany(() => ModulePermission, (permission) => permission.module)
  permissions!: ModulePermission[];
}
