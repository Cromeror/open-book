/**
 * AuthService unit tests
 *
 * Tests for authentication service functionality.
 */
import { describe, it, expect } from 'vitest';
import * as bcrypt from 'bcrypt';
import { createUser, createUserAttributes, DEFAULT_TEST_PASSWORD } from '../../../test/factories';

describe('AuthService', () => {
  describe('User Factory', () => {
    it('should create a user with default values', async () => {
      const user = await createUser();

      expect(user.email).toBeDefined();
      expect(user.passwordHash).toBeDefined();
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
      expect(user.isSuperAdmin).toBe(false);
      expect(user.isActive).toBe(true);
    });

    it('should create a user with custom values', async () => {
      const user = await createUser({
        email: 'custom@example.com',
        firstName: 'Juan',
        lastName: 'Perez',
        isSuperAdmin: true,
      });

      expect(user.email).toBe('custom@example.com');
      expect(user.firstName).toBe('Juan');
      expect(user.lastName).toBe('Perez');
      expect(user.isSuperAdmin).toBe(true);
    });

    it('should hash the password correctly', async () => {
      const user = await createUser({ password: 'MySecretPassword123' });

      const isMatch = await bcrypt.compare('MySecretPassword123', user.passwordHash);
      expect(isMatch).toBe(true);
    });

    it('should use default test password', async () => {
      const user = await createUser();

      const isMatch = await bcrypt.compare(DEFAULT_TEST_PASSWORD, user.passwordHash);
      expect(isMatch).toBe(true);
    });
  });

  describe('User Attributes Factory', () => {
    it('should create user attributes for API requests', () => {
      const attrs = createUserAttributes();

      expect(attrs.email).toBeDefined();
      expect(attrs.password).toBeDefined();
      expect(attrs.firstName).toBeDefined();
      expect(attrs.lastName).toBeDefined();
      expect(attrs.publicAccountConsent).toBe(false);
    });

    it('should allow overriding attributes', () => {
      const attrs = createUserAttributes({
        email: 'test@example.com',
        publicAccountConsent: true,
      });

      expect(attrs.email).toBe('test@example.com');
      expect(attrs.publicAccountConsent).toBe(true);
    });
  });

  describe('Password Validation', () => {
    it('should validate correct password', async () => {
      const password = 'SecurePassword123';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'SecurePassword123';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });
});
