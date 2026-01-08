/**
 * User response type (without sensitive data)
 * Used for API responses
 *
 * Note: System uses module-based permissions instead of roles.
 * SuperAdmin status is only exposed in admin contexts, not in general user responses.
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
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

/**
 * User response for admin endpoints (includes additional fields)
 * Only SuperAdmin can access this data
 */
export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  publicAccountConsent: boolean;
  consentDate?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
