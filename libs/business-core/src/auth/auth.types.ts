/**
 * Authentication and authorization type definitions
 */

import type { ModuleWithActions } from '../modules';

/**
 * User information from authentication
 */
export interface AuthUser {
  /** User ID */
  id: string;
  /** User email */
  email: string;
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** Phone number */
  phone?: string;
  /** Whether user is a SuperAdmin */
  isSuperAdmin: boolean;
  /** Account status */
  isActive: boolean;
  /** Public account consent (for Habeas Data compliance) */
  publicAccountConsent: boolean;
  /** Consent date */
  consentDate?: string;
  /** Last login timestamp */
  lastLoginAt?: string;
  /** Account creation timestamp */
  createdAt: string;
  /** Account update timestamp */
  updatedAt: string;
}

/**
 * Response from /api/auth/me endpoint
 */
export interface AuthMeResponse {
  /** User information */
  user: AuthUser;
  /** Modules with actions available to the user */
  modules: ModuleWithActions[];
}

/**
 * Login request DTO
 */
export interface LoginDto {
  /** User email */
  email: string;
  /** User password */
  password: string;
}

/**
 * Register request DTO
 */
export interface RegisterDto {
  /** User email */
  email: string;
  /** User password */
  password: string;
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** Optional phone number */
  phone?: string;
  /** Public account consent */
  publicAccountConsent: boolean;
}

/**
 * Authentication tokens response
 */
export interface TokenResponse {
  /** JWT access token */
  accessToken: string;
  /** Optional refresh token */
  refreshToken?: string;
  /** Token type (usually 'Bearer') */
  tokenType: string;
  /** Token expiration time in seconds */
  expiresIn: number;
}

/**
 * Login response (combines tokens and user info)
 */
export interface LoginResponse extends TokenResponse {
  /** User information */
  user: Omit<AuthUser, 'password'>;
}
