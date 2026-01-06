import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

import { BaseEntity } from './base.entity';
import { User } from './user.entity';

/**
 * Refresh token entity for JWT authentication
 *
 * Stores refresh tokens in database to allow:
 * - Token rotation (new token on each refresh)
 * - Token revocation (logout, security)
 * - Detection of token reuse (potential theft)
 *
 * @example
 * ```typescript
 * const refreshToken = new RefreshToken();
 * refreshToken.token = 'hashed-token-value';
 * refreshToken.userId = user.id;
 * refreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
 * await refreshToken.save();
 * ```
 */
@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  /**
   * Hashed refresh token value
   * The actual token sent to client is unhashed
   */
  @Column({
    type: 'varchar',
    length: 255,
  })
  @Index('idx_refresh_tokens_token')
  token!: string;

  /**
   * ID of the user who owns this token
   */
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  @Index('idx_refresh_tokens_user_id')
  userId!: string;

  /**
   * User who owns this token
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * When this token expires
   */
  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  /**
   * When this token was revoked (logout, rotation)
   * NULL means token is still valid
   */
  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt?: Date | null;

  /**
   * IP address that created this token
   */
  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress?: string | null;

  /**
   * User agent that created this token
   */
  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent?: string | null;

  /**
   * Check if token is valid (not expired and not revoked)
   */
  get isValid(): boolean {
    return !this.revokedAt && this.expiresAt > new Date();
  }
}
