import * as bcrypt from 'bcrypt';

/**
 * Default salt rounds for bcrypt
 * 12 rounds provides good security while maintaining reasonable performance
 * Can be overridden via BCRYPT_SALT_ROUNDS environment variable
 */
const DEFAULT_SALT_ROUNDS = 12;

/**
 * Get the configured salt rounds from environment or use default
 */
function getSaltRounds(): number {
  const envRounds = process.env['BCRYPT_SALT_ROUNDS'];
  if (envRounds) {
    const parsed = parseInt(envRounds, 10);
    if (!isNaN(parsed) && parsed >= 10) {
      return parsed;
    }
  }
  return DEFAULT_SALT_ROUNDS;
}

/**
 * Hash a password using bcrypt
 *
 * IMPORTANT: Always use this function before storing passwords.
 * NEVER store plain text passwords in the database.
 *
 * @param password - The plain text password to hash
 * @returns The hashed password
 *
 * @example
 * ```typescript
 * const hash = await hashPassword('userPassword123');
 * user.passwordHash = hash;
 * await user.save();
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = getSaltRounds();
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 *
 * Use this function to verify user credentials during login.
 *
 * @param password - The plain text password to verify
 * @param hash - The stored password hash
 * @returns True if the password matches, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await comparePassword(inputPassword, user.passwordHash);
 * if (!isValid) {
 *   throw new UnauthorizedException('Invalid credentials');
 * }
 * ```
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
