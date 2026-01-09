import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Group entity represents a hierarchical grouping within a condominium
 *
 * Groups can represent towers, blocks, floors, sections, etc.
 * They can be nested to any depth.
 * Groups can contain other groups (subgroups) and properties.
 *
 * The hierarchy uses:
 * - parentId: reference to parent group (null for root groups)
 * - depth: level in the hierarchy (1 for root, 2 for first level children, etc.)
 * - path: materialized path for efficient ancestor/descendant queries
 *
 * @example
 * ```typescript
 * // Root group (Tower)
 * const tower = new Group();
 * tower.name = 'Torre A';
 * tower.condominiumId = condoId;
 * tower.parentId = null;
 * tower.depth = 1;
 * tower.path = tower.id;
 *
 * // Subgroup (Floor)
 * const floor = new Group();
 * floor.name = 'Piso 1';
 * floor.condominiumId = condoId;
 * floor.parentId = tower.id;
 * floor.depth = 2;
 * floor.path = `${tower.id}.${floor.id}`;
 * ```
 */
@Entity('groups')
@Index('idx_groups_condominium', ['condominiumId'])
@Index('idx_groups_parent', ['parentId'])
@Index('idx_groups_path', ['path'])
export class Group extends BaseEntity {
  /**
   * Name of the group (e.g., "Torre A", "Piso 1", "Bloque Norte")
   */
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  /**
   * Optional description of the group
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * ID of the condominium this group belongs to
   */
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId!: string;

  /**
   * Reference to the condominium
   */
  @ManyToOne('Condominium', 'groups')
  @JoinColumn({ name: 'condominium_id' })
  condominium!: import('./condominium.entity').Condominium;

  /**
   * ID of the parent group (null for root groups)
   */
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string | null;

  /**
   * Reference to the parent group
   */
  @ManyToOne('Group', 'children', { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Group | null;

  /**
   * Child groups (subgroups)
   */
  @OneToMany('Group', 'parent')
  children!: Group[];

  /**
   * Properties directly under this group
   */
  @OneToMany('Property', 'group')
  properties!: import('./property.entity').Property[];

  /**
   * Depth level in the hierarchy
   * 1 = root group, 2 = child of root, etc.
   */
  @Column({ type: 'integer', default: 1 })
  depth!: number;

  /**
   * Materialized path for efficient hierarchy queries
   * Format: "uuid1.uuid2.uuid3" (ancestors from root to this group)
   */
  @Column({ type: 'text', nullable: true })
  path?: string;

  /**
   * Display order within parent (for sorting)
   */
  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder!: number;

  /**
   * Whether the group is active
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
