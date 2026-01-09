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
 * Property types enumeration
 */
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  OFFICE = 'OFFICE',
  COMMERCIAL = 'COMMERCIAL',
  PARKING = 'PARKING',
  STORAGE = 'STORAGE',
  OTHER = 'OTHER',
}

/**
 * Property entity represents the smallest unit in a condominium (leaf node)
 *
 * Properties are always leaves in the hierarchy - they cannot contain
 * other groups or properties. They can be directly under a condominium
 * or under a group.
 *
 * Examples: apartments, offices, parking spaces, storage units
 *
 * @example
 * ```typescript
 * // Property under a group
 * const apt = new Property();
 * apt.identifier = '101';
 * apt.type = PropertyType.APARTMENT;
 * apt.condominiumId = condoId;
 * apt.groupId = floorId; // Under "Piso 1"
 *
 * // Property directly under condominium
 * const parking = new Property();
 * parking.identifier = 'P-001';
 * parking.type = PropertyType.PARKING;
 * parking.condominiumId = condoId;
 * parking.groupId = null; // No group
 * ```
 */
@Entity('properties')
@Index('idx_properties_condominium', ['condominiumId'])
@Index('idx_properties_group', ['groupId'])
@Index('idx_properties_identifier', ['condominiumId', 'identifier'])
export class Property extends BaseEntity {
  /**
   * Unique identifier within the condominium (e.g., "101", "P-001", "Local 5")
   */
  @Column({ type: 'varchar', length: 50 })
  identifier!: string;

  /**
   * Type of property
   */
  @Column({ type: 'varchar', length: 20, default: PropertyType.APARTMENT })
  type!: PropertyType;

  /**
   * Optional description or additional details
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Floor number (if applicable)
   */
  @Column({ type: 'integer', nullable: true })
  floor?: number;

  /**
   * Area in square meters (if known)
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  area?: number;

  /**
   * ID of the condominium this property belongs to
   */
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId!: string;

  /**
   * Reference to the condominium
   */
  @ManyToOne('Condominium', 'properties')
  @JoinColumn({ name: 'condominium_id' })
  condominium!: import('./condominium.entity').Condominium;

  /**
   * ID of the group this property belongs to (null if directly under condominium)
   */
  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId?: string | null;

  /**
   * Reference to the parent group
   */
  @ManyToOne('Group', 'properties', { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group?: import('./group.entity').Group | null;

  /**
   * Residents associated with this property
   */
  @OneToMany('PropertyResident', 'property')
  residents!: import('./property-resident.entity').PropertyResident[];

  /**
   * Display order within group (for sorting)
   */
  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder!: number;

  /**
   * Whether the property is active
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
