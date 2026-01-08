import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Condominium } from './condominium.entity';

/**
 * Status of a fundraising goal
 *
 * State machine transitions:
 * - ACTIVE -> PAUSED (requires justification)
 * - ACTIVE -> COMPLETED (goal reached or admin decision)
 * - ACTIVE -> CANCELLED (requires justification)
 * - PAUSED -> ACTIVE (resume)
 * - PAUSED -> CANCELLED (requires justification)
 * - COMPLETED -> (terminal, no transitions)
 * - CANCELLED -> (terminal, no transitions)
 */
export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Goal entity represents a fundraising goal for a condominium
 *
 * A Goal (Objetivo de Recaudo) defines:
 * - A target amount to be raised
 * - A time period (start and optional end date)
 * - A status that follows a defined state machine
 *
 * Goals are the top-level container for:
 * - Activities that collect contributions
 * - Progress tracking against the target amount
 *
 * Follows SUMMARY.md section 4.1 specification.
 *
 * @example
 * ```typescript
 * const goal = new Goal();
 * goal.name = 'Elevator Repair';
 * goal.description = 'Preventive maintenance of all 4 elevators';
 * goal.targetAmount = '15000000.00';
 * goal.startDate = new Date('2025-02-01');
 * goal.endDate = new Date('2025-06-30');
 * goal.status = GoalStatus.ACTIVE;
 * ```
 */
@Entity('goals')
@Index('idx_goals_condominium_status', ['condominiumId', 'status'])
export class Goal extends BaseEntity {
  /**
   * Name of the fundraising goal
   */
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  /**
   * Detailed description of the goal
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Target amount to be raised
   * Using decimal(15,2) for Colombian Peso precision:
   * - Up to 13 integer digits (9,999,999,999,999.99 COP)
   * - 2 decimal places
   */
  @Column({
    name: 'target_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  targetAmount!: string; // TypeORM returns decimal as string for precision

  /**
   * Start date of the fundraising period
   */
  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  /**
   * End date of the fundraising period (optional)
   * Some goals may not have a defined end date
   */
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  /**
   * Current status of the goal
   * Follows the state machine defined in GoalStatus
   */
  @Column({
    type: 'enum',
    enum: GoalStatus,
    enumName: 'goal_status_enum',
    default: GoalStatus.ACTIVE,
  })
  @Index('idx_goals_status')
  status!: GoalStatus;

  // ============================================
  // Relations
  // ============================================

  /**
   * Foreign key to the condominium
   */
  @Column({ name: 'condominium_id', type: 'uuid' })
  @Index('idx_goals_condominium')
  condominiumId!: string;

  /**
   * The condominium this goal belongs to
   */
  @ManyToOne(() => Condominium, (condominium) => condominium.goals, {
    onDelete: 'RESTRICT', // Cannot delete condominium with goals
  })
  @JoinColumn({ name: 'condominium_id' })
  condominium!: Condominium;

  /**
   * State change history for audit trail
   */
  @OneToMany('GoalHistory', 'goal')
  history!: import('./goal-history.entity').GoalHistory[];

  // ============================================
  // Computed properties
  // ============================================

  /**
   * Returns the target amount as a number
   * Use this for calculations, but be aware of floating point limitations
   */
  get targetAmountNumber(): number {
    return parseFloat(this.targetAmount);
  }

  /**
   * Check if the goal is in a terminal state
   */
  get isTerminal(): boolean {
    return (
      this.status === GoalStatus.COMPLETED ||
      this.status === GoalStatus.CANCELLED
    );
  }

  /**
   * Check if the goal can be modified
   * Only active or paused goals can be modified
   */
  get isModifiable(): boolean {
    return (
      this.status === GoalStatus.ACTIVE ||
      this.status === GoalStatus.PAUSED
    );
  }
}
