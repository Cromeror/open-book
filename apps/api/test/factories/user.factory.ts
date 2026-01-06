/**
 * User factory for API testing
 *
 * Creates User entities with realistic test data using Faker.
 */
import { faker } from '@faker-js/faker/locale/es_MX';
import * as bcrypt from 'bcrypt';
import { User } from '../../src/entities/user.entity';

/**
 * User factory options
 */
export interface UserFactoryOptions {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isSuperAdmin?: boolean;
  isActive?: boolean;
  publicAccountConsent?: boolean;
  consentDate?: Date;
  consentIpAddress?: string;
  consentUserAgent?: string;
  lastLoginAt?: Date;
}

/**
 * Default password used for test users
 */
export const DEFAULT_TEST_PASSWORD = 'TestPassword123';

/**
 * Create a User entity with test data
 *
 * @param options - Override default values
 * @returns User entity (not persisted)
 *
 * @example
 * ```typescript
 * // Create a basic user
 * const user = await createUser();
 *
 * // Create an admin user
 * const admin = await createUser({ isSuperAdmin: true });
 *
 * // Create with specific email
 * const user = await createUser({ email: 'test@example.com' });
 * ```
 */
export async function createUser(options: UserFactoryOptions = {}): Promise<User> {
  const user = new User();

  user.email = options.email ?? faker.internet.email().toLowerCase();
  user.passwordHash = await bcrypt.hash(options.password ?? DEFAULT_TEST_PASSWORD, 10);
  user.firstName = options.firstName ?? faker.person.firstName();
  user.lastName = options.lastName ?? faker.person.lastName();
  user.phone = options.phone ?? faker.phone.number({ style: 'international' });
  user.isSuperAdmin = options.isSuperAdmin ?? false;
  user.isActive = options.isActive ?? true;
  user.publicAccountConsent = options.publicAccountConsent ?? false;
  user.consentDate = options.consentDate ?? new Date();
  user.consentIpAddress = options.consentIpAddress ?? faker.internet.ip();
  user.consentUserAgent = options.consentUserAgent ?? faker.internet.userAgent();
  user.lastLoginAt = options.lastLoginAt;

  return user;
}

/**
 * Create a super admin user
 */
export async function createSuperAdmin(
  options: Omit<UserFactoryOptions, 'isSuperAdmin'> = {}
): Promise<User> {
  return createUser({ ...options, isSuperAdmin: true });
}

/**
 * Create an inactive user
 */
export async function createInactiveUser(
  options: Omit<UserFactoryOptions, 'isActive'> = {}
): Promise<User> {
  return createUser({ ...options, isActive: false });
}

/**
 * Create user attributes without creating entity
 * Useful for API request bodies
 */
export function createUserAttributes(options: UserFactoryOptions = {}): {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  publicAccountConsent: boolean;
} {
  return {
    email: options.email ?? faker.internet.email().toLowerCase(),
    password: options.password ?? DEFAULT_TEST_PASSWORD,
    firstName: options.firstName ?? faker.person.firstName(),
    lastName: options.lastName ?? faker.person.lastName(),
    phone: options.phone ?? faker.phone.number({ style: 'international' }),
    publicAccountConsent: options.publicAccountConsent ?? false,
  };
}
