import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Goal, GoalStatus } from './goal.entity';
import { User } from './user.entity';

/**
 * GoalHistory entity records all state changes for fundraising goals
 *
 * This entity implements the TRACEABILITY principle:
 * - Every state change is logged with who, when, and why
 * - Records are immutable (insert only, no updates or deletes)
 * - Provides complete audit trail for compliance
 *
 * According to SUMMARY.md transparency principles:
 * - Traceability: Every change logged with date and responsible party
 * - Immutability: Records cannot be deleted or modified
 * - Audit: Complete change history available
 *
 * @example
 * ```typescript
 * const history = new GoalHistory();
 * history.goalId = goal.id;
 * history.previousStatus = GoalStatus.ACTIVE;
 * history.newStatus = GoalStatus.PAUSED;
 * history.justification = 'Insufficient funds temporarily';
 * history.userId = currentUser.id;
 * ```
 */
@Entity('goal_history')
@Index('idx_goal_history_goal_date', ['goalId', 'createdAt'])
export class GoalHistory {
  /**
   * Primary key - UUID v4 generated automatically
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Foreign key to the goal
   */
  @Column({ name: 'goal_id', type: 'uuid' })
  @Index('idx_goal_history_goal')
  goalId!: string;

  /**
   * The goal this history entry belongs to
   */
  @ManyToOne(() => Goal, (goal) => goal.history, {
    onDelete: 'CASCADE', // If goal is deleted, delete history
  })
  @JoinColumn({ name: 'goal_id' })
  goal!: Goal;

  /**
   * State before the transition
   */
  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: GoalStatus,
    enumName: 'goal_status_enum',
  })
  previousStatus!: GoalStatus;

  /**
   * State after the transition
   */
  @Column({
    name: 'new_status',
    type: 'enum',
    enum: GoalStatus,
    enumName: 'goal_status_enum',
  })
  newStatus!: GoalStatus;

  /**
   * Justification for the state change
   * Required for some transitions (PAUSED, CANCELLED)
   */
  @Column({ type: 'text', nullable: true })
  justification?: string;

  /**
   * Foreign key to the user who made the change
   */
  @Column({ name: 'user_id', type: 'uuid' })
  @Index('idx_goal_history_user')
  userId!: string;

  /**
   * The user who made the state change
   */
  @ManyToOne(() => User, {
    onDelete: 'RESTRICT', // Cannot delete user with history entries
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * IP address from which the change was made
   * For additional audit trail
   */
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  /**
   * User agent of the client that made the change
   */
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  /**
   * Timestamp when the change was recorded
   * This is NOT updatable - history is immutable
   */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
