import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

/**
 * Authentication event types
 */
export enum AuthEvent {
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  REFRESH = 'REFRESH',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

/**
 * Authentication log entity for security audit
 *
 * Logs all authentication events for:
 * - Security monitoring
 * - Compliance (trazabilidad)
 * - Suspicious activity detection
 *
 * @example
 * ```typescript
 * const log = new AuthLog();
 * log.event = AuthEvent.LOGIN;
 * log.email = 'user@example.com';
 * log.userId = user.id;
 * log.ipAddress = '192.168.1.1';
 * log.success = true;
 * await log.save();
 * ```
 */
@Entity('auth_logs')
export class AuthLog extends BaseEntity {
  /**
   * ID of the user (if authenticated)
   * NULL for failed login attempts with unknown email
   */
  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  @Index('idx_auth_logs_user_id')
  userId?: string | null;

  /**
   * User relation (optional - may not exist for failed attempts)
   */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  /**
   * Type of authentication event
   */
  @Column({
    type: 'varchar',
    length: 20,
  })
  @Index('idx_auth_logs_event')
  event!: AuthEvent;

  /**
   * Email attempted (always logged for audit)
   */
  @Column({
    type: 'varchar',
    length: 255,
  })
  @Index('idx_auth_logs_email')
  email!: string;

  /**
   * Client IP address
   */
  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
  })
  @Index('idx_auth_logs_ip_address')
  ipAddress!: string;

  /**
   * Client user agent
   */
  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent?: string | null;

  /**
   * Whether the authentication was successful
   */
  @Column({
    type: 'boolean',
  })
  success!: boolean;

  /**
   * Reason for failure (if applicable)
   * NEVER include passwords or sensitive data
   */
  @Column({
    name: 'fail_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  failReason?: string | null;
}
