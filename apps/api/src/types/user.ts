/**
 * User role enumeration
 * Defines the roles available in the system
 */
export enum UserRole {
  /** System administrator with full access */
  ADMIN = 'ADMIN',
  /** Building resident with standard access */
  RESIDENT = 'RESIDENT',
}

/**
 * User response type (without sensitive data)
 * Used for API responses
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  publicAccountConsent: boolean;
  consentDate?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
}

/**
 * User creation data
 * Used for registration
 */
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  publicAccountConsent: boolean;
}
