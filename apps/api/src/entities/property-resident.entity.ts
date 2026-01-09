import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Relation type between user and property
 */
export enum RelationType {
  OWNER = 'OWNER',
  TENANT = 'TENANT',
  OTHER = 'OTHER',
}

/**
 * Status of the property-resident association
 */
export enum AssociationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REJECTED = 'REJECTED',
}

/**
 * PropertyResident entity represents the association between users and properties
 *
 * This is a many-to-many relationship with additional metadata:
 * - Relation type (owner, tenant, etc.)
 * - Status (pending approval, active, inactive)
 * - Validity dates
 * - Primary contact flag
 *
 * A user can only have one ACTIVE association per property.
 *
 * @example
 * ```typescript
 * const resident = new PropertyResident();
 * resident.propertyId = propertyId;
 * resident.userId = userId;
 * resident.relationType = RelationType.OWNER;
 * resident.status = AssociationStatus.ACTIVE;
 * resident.isPrimary = true;
 * ```
 */
@Entity('property_residents')
@Index('idx_property_residents_property', ['propertyId'])
@Index('idx_property_residents_user', ['userId'])
@Index(
  'idx_property_residents_active_unique',
  ['propertyId', 'userId'],
  { unique: true, where: "status = 'ACTIVE'" }
)
export class PropertyResident extends BaseEntity {
  /**
   * ID of the property
   */
  @Column({ name: 'property_id', type: 'uuid' })
  propertyId!: string;

  /**
   * Reference to the property
   */
  @ManyToOne('Property', 'residents')
  @JoinColumn({ name: 'property_id' })
  property!: import('./property.entity').Property;

  /**
   * ID of the user (resident)
   */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  /**
   * Reference to the user
   */
  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user!: import('./user.entity').User;

  /**
   * Type of relation (owner, tenant, other)
   */
  @Column({ name: 'relation_type', type: 'varchar', length: 20 })
  relationType!: RelationType;

  /**
   * Status of the association
   */
  @Column({ type: 'varchar', length: 20, default: AssociationStatus.PENDING })
  status!: AssociationStatus;

  /**
   * Start date of the association
   */
  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate?: Date;

  /**
   * End date of the association (for temporary residents)
   */
  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate?: Date;

  /**
   * Whether this is the primary contact for the property
   */
  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  /**
   * ID of the user who approved this association
   */
  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  /**
   * Timestamp when the association was approved
   */
  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  /**
   * Reason for rejection (if status is REJECTED)
   */
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;
}
