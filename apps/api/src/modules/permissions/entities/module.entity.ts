import { Entity, Column, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../entities/base.entity';

import { ModulePermission } from './module-permission.entity';
import type { ModuleAction } from '../types/module-actions.types';

/**
 * Module type - determines how the module is rendered
 */
export type ModuleType = 'crud' | 'specialized';

/**
 * Navigation configuration for a module
 */
export interface NavConfig {
  path: string;
  order: number;
}

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
 * module.type = 'crud';
 * module.icon = 'Target';
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
   * Lucide icon name for the module
   */
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  icon?: string;

  /**
   * Module type: 'crud' or 'specialized'
   * - crud: Uses GenericCRUDModule component
   * - specialized: Uses a custom component
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'crud',
  })
  type!: ModuleType;

  /**
   * Entity name for CRUD modules (e.g., 'Objetivo')
   * Only used for crud type modules
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  entity?: string;

  /**
   * API endpoint for CRUD modules (e.g., '/api/goals')
   * Only used for crud type modules
   */
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  endpoint?: string;

  /**
   * Component name for specialized modules (e.g., 'ReportsModule')
   * Only used for specialized type modules
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  component?: string;

  /**
   * Navigation configuration (path and order)
   */
  @Column({
    name: 'nav_config',
    type: 'jsonb',
    nullable: true,
  })
  navConfig?: NavConfig;

  /**
   * Actions configuration with settings for each action
   * Actions are segregated based on user permissions
   */
  @Column({
    name: 'actions_config',
    type: 'jsonb',
    nullable: true,
  })
  actionsConfig?: ModuleAction[];

  /**
   * Display order in navigation
   */
  @Column({
    type: 'integer',
    default: 0,
  })
  order!: number;

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
