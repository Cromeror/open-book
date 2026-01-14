import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * CondominiumManager entity represents the association between users and condominiums
 * where the user holds a managerial or administrative role.
 *
 * This is a junction table for the many-to-many relationship between users and condominiums.
 * Multiple managers can be assigned to a condominium.
 * A user can manage multiple condominiums.
 *
 * Note: This table is for reference/listing purposes.
 * Access control is handled by the granular permissions system (UserPermission with scope COPROPIEDAD).
 *
 * @example
 * ```typescript
 * const manager = new CondominiumManager();
 * manager.condominiumId = condoId;
 * manager.userId = userId;
 * manager.isPrimary = true;
 * manager.assignedAt = new Date();
 * manager.assignedBy = superAdminId;
 * ```
 */
@Entity('condominium_managers')
@Index('idx_condominium_managers_condominium', ['condominiumId'])
@Index('idx_condominium_managers_user', ['userId'])
@Index('idx_condominium_managers_unique', ['condominiumId', 'userId'], { unique: true })
export class CondominiumManager extends BaseEntity {
  /**
   * ID of the condominium
   */
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId!: string;

  /**
   * Reference to the condominium
   */
  @ManyToOne('Condominium', 'managers')
  @JoinColumn({ name: 'condominium_id' })
  condominium!: import('./condominium.entity').Condominium;

  /**
   * ID of the user (manager)
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
   * Whether this is the primary contact for the condominium
   */
  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  /**
   * Whether this assignment is active
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  /**
   * Timestamp when the manager was assigned
   */
  @Column({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt!: Date;

  /**
   * ID of the SuperAdmin who made the assignment
   */
  @Column({ name: 'assigned_by', type: 'uuid' })
  assignedBy!: string;
}
