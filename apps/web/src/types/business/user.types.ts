/**
 * User Types
 *
 * Represents a user in the system.
 * Pure business type - no ORM decorators, no transport concerns.
 */

/**
 * Core user type with business attributes
 */
export interface User {
  /** Unique identifier */
  id: string;
  /** User email (unique) */
  email: string;
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** Phone number */
  phone?: string;
  /** Whether user has super admin privileges */
  isSuperAdmin: boolean;
  /** Account status */
  isActive: boolean;
  /** Public account consent for Habeas Data (Ley 1581/2012) */
  publicAccountConsent: boolean;
  /** Date when consent was given */
  consentDate?: string;
  /** Last login timestamp */
  lastLoginAt?: string;
  /** Account creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * User without sensitive fields
 * Used when exposing user data externally
 */
export type PublicUser = Omit<User, 'isSuperAdmin'>;
