import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

/**
 * User entity for authentication and profile management
 *
 * Stores user credentials, profile information, and consent for account visibility.
 * Complies with Colombian Law 1581/2012 (Habeas Data) for personal data handling.
 *
 * @example
 * ```typescript
 * const user = new User();
 * user.email = 'usuario@ejemplo.com';
 * user.passwordHash = await hashPassword('secret');
 * user.firstName = 'Juan';
 * user.lastName = 'Perez';
 * user.publicAccountConsent = true;
 * await user.save();
 * ```
 */
@Entity('users')
export class User extends BaseEntity {
  /**
   * User email address - used for authentication
   * Must be unique across all users
   */
  @Index('idx_users_email', { unique: true })
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  /**
   * Hashed password - NEVER store plain text passwords
   * Use bcrypt with minimum 12 salt rounds
   */
  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
  })
  passwordHash!: string;

  /**
   * User's first name
   */
  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName!: string;

  /**
   * User's last name
   */
  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName!: string;

  /**
   * User's phone number (optional)
   * Format: +57XXXXXXXXXX for Colombia
   */
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone?: string;

  /**
   * Whether this user is the SuperAdmin
   *
   * Only ONE user should have this flag set to true.
   * SuperAdmin has full access to all system features and can manage
   * module permissions and user pools.
   *
   * Default: false
   */
  @Column({
    name: 'is_super_admin',
    type: 'boolean',
    default: false,
  })
  isSuperAdmin!: boolean;

  /**
   * Whether the user account is active
   * Inactive users cannot log in
   */
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  /**
   * User consent for public account visibility
   *
   * Per Colombian Law 1581/2012 (Habeas Data):
   * - true: User consents to public account statements
   * - false: Account statements are private
   *
   * Changes to this field must go through PQR system
   */
  @Column({
    name: 'public_account_consent',
    type: 'boolean',
    default: false,
  })
  publicAccountConsent!: boolean;

  /**
   * Date when consent was registered
   * Automatically set during registration
   */
  @Column({
    name: 'consent_date',
    type: 'timestamptz',
    nullable: true,
  })
  consentDate?: Date;

  /**
   * IP address when consent was given
   * For audit trail purposes
   */
  @Column({
    name: 'consent_ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  consentIpAddress?: string;

  /**
   * User agent when consent was given
   * For audit trail purposes
   */
  @Column({
    name: 'consent_user_agent',
    type: 'text',
    nullable: true,
  })
  consentUserAgent?: string;

  /**
   * Timestamp of last successful login
   */
  @Column({
    name: 'last_login_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastLoginAt?: Date;

  /**
   * Get user's full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
