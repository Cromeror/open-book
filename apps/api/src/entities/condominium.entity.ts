import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Condominium entity represents a residential complex (copropiedad)
 *
 * A Condominium is the main organizational unit that contains:
 * - Apartments
 * - Fundraising goals
 * - Activities and contributions
 *
 * @example
 * ```typescript
 * const condominium = new Condominium();
 * condominium.name = 'Conjunto Residencial Los Pinos';
 * condominium.address = 'Calle 100 #15-20';
 * condominium.city = 'Bogotá';
 * condominium.unitCount = 150;
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
   */
  @Column({ name: 'unit_count', type: 'integer' })
  unitCount!: number;

  /**
   * Whether the condominium is active in the system
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  // ============================================
  // Relations - Forward declarations
  // ============================================

  /**
   * Fundraising goals associated with this condominium
   * Circular import handled via string reference
   */
  @OneToMany('Goal', 'condominium')
  goals!: import('./goal.entity').Goal[];
}
