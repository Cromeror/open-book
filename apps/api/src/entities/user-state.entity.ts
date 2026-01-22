import { Entity, Column, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

/**
 * UserState entity for storing user's current state and preferences
 *
 * This entity stores user-specific state that persists across sessions,
 * such as the currently selected condominium, theme preferences, etc.
 *
 * Design decisions:
 * - One UserState per User (1:1 relationship)
 * - Created automatically when first accessed if doesn't exist
 * - selectedCondominiumId defaults to user's primary condominium
 *
 * @example
 * ```typescript
 * const state = await userStateService.getOrCreate(userId);
 * state.selectedCondominiumId; // Currently selected condominium
 * state.theme; // 'light' | 'dark' | 'system'
 * ```
 */
@Entity('user_states')
export class UserState extends BaseEntity {
  /**
   * Reference to the user who owns this state
   */
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  @Index()
  userId!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  /**
   * Currently selected condominium ID
   * Defaults to user's primary condominium when state is created
   */
  @Column({
    name: 'selected_condominium_id',
    type: 'uuid',
    nullable: true,
  })
  selectedCondominiumId?: string;

  /**
   * User's preferred theme
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'system',
  })
  theme!: 'light' | 'dark' | 'system';

  /**
   * Whether the sidebar is collapsed
   */
  @Column({
    name: 'sidebar_collapsed',
    type: 'boolean',
    default: false,
  })
  sidebarCollapsed!: boolean;

  /**
   * User's preferred language
   */
  @Column({
    type: 'varchar',
    length: 10,
    default: 'es',
  })
  language!: string;
}
