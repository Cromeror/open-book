import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Condominium entity represents a residential complex (copropiedad)
 *
 * A Condominium is the root entity that contains:
 * - Groups (hierarchical groupings like towers, floors, blocks)
 * - Properties (apartments, offices, parking spaces - always leaves)
 * - Fundraising goals
 *
 * Only SuperAdmin can create condominiums.
 * Users with permissions can configure internal structure.
 *
 * @example
 * ```typescript
 * const condominium = new Condominium();
 * condominium.name = 'Conjunto Residencial Los Pinos';
 * condominium.address = 'Calle 100 #15-20';
 * condominium.city = 'Bogotá';
 * ```
 */
@Entity('condominiums')
export class Condominium extends BaseEntity {
  /**
   * Name of the condominium
   */
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  /**
   * Tax ID (NIT) - Optional, must be unique if provided
   * Colombian businesses and condominiums can have NIT
   */
  @Index('idx_condominiums_nit', { unique: true, where: 'nit IS NOT NULL' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  nit?: string;

  /**
   * Physical address of the condominium
   */
  @Column({ type: 'varchar', length: 500 })
  address!: string;

  /**
   * City where the condominium is located
   */
  @Column({ type: 'varchar', length: 100 })
  city!: string;

  /**
   * Total number of residential units in the condominium
   * @deprecated Use properties count instead - kept for backwards compatibility
   */
  @Column({ name: 'unit_count', type: 'integer', default: 0 })
  unitCount!: number;

  /**
   * Whether the condominium is active in the system
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // ============================================
  // Relations
  // ============================================

  /**
   * Groups (towers, blocks, floors, etc.) in this condominium
   */
  @OneToMany('Group', 'condominium')
  groups!: import('./group.entity').Group[];

  /**
   * Properties (apartments, offices, etc.) in this condominium
   */
  @OneToMany('Property', 'condominium')
  properties!: import('./property.entity').Property[];

  /**
   * Fundraising goals associated with this condominium
   */
  @OneToMany('Goal', 'condominium')
  goals!: import('./goal.entity').Goal[];

  /**
   * Managers assigned to this condominium
   */
  @OneToMany('CondominiumManager', 'condominium')
  managers!: import('./condominium-manager.entity').CondominiumManager[];
}
