/**
 * Authentication helpers for API testing
 *
 * Provides utilities for testing authenticated endpoints.
 */
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { User } from '../../src/entities/user.entity';

/**
 * JWT payload structure for tests
 */
export interface TestJwtPayload {
  sub: string;
  email: string;
  isSuperAdmin: boolean;
  type: 'access' | 'refresh';
}

/**
 * Default test JWT secret
 */
const TEST_JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-key-that-is-at-least-32-characters-long';

/**
 * Generate a test access token for a user
 *
 * @param user - User to generate token for
 * @param expiresInSeconds - Token expiration in seconds (default: 900 = 15m)
 * @returns JWT access token string
 */
export function generateTestAccessToken(user: User, expiresInSeconds = 900): string {
  const payload: TestJwtPayload = {
    sub: user.id,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
    type: 'access',
  };

  const options: SignOptions = { expiresIn: expiresInSeconds };
  return jwt.sign(payload, TEST_JWT_SECRET, options);
}

/**
 * Generate a test refresh token for a user
 *
 * @param user - User to generate token for
 * @param expiresInSeconds - Token expiration in seconds (default: 604800 = 7d)
 * @returns JWT refresh token string
 */
export function generateTestRefreshToken(user: User, expiresInSeconds = 604800): string {
  const payload: TestJwtPayload = {
    sub: user.id,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
    type: 'refresh',
  };

  const options: SignOptions = { expiresIn: expiresInSeconds };
  return jwt.sign(payload, TEST_JWT_SECRET, options);
}

/**
 * Generate an expired test token
 *
 * @param user - User to generate token for
 * @returns Expired JWT token
 */
export function generateExpiredToken(user: User): string {
  const payload: TestJwtPayload = {
    sub: user.id,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
    type: 'access',
  };

  // Create token that expires immediately (1 second ago)
  const options: SignOptions = { expiresIn: -1 };
  return jwt.sign(payload, TEST_JWT_SECRET, options);
}

/**
 * Generate an invalid token with wrong signature
 */
export function generateInvalidToken(): string {
  return 'invalid.jwt.token';
}

/**
 * Create Authorization header value
 *
 * @param token - JWT token
 * @returns Bearer token header value
 */
export function authHeader(token: string): string {
  return `Bearer ${token}`;
}
