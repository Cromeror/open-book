import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Cached permissions structure for a user
 */
interface CachedUserPermissions {
  /** Module codes the user has access to (direct + pool) */
  moduleAccess: Set<string>;
  /** Permission strings with scope (format: "module:action:scope:scopeId?") */
  permissions: Map<string, { scope: string; scopeId?: string }[]>;
  /** Timestamp when cache was created */
  cachedAt: number;
}

/**
 * Service for caching user permissions
 *
 * Provides in-memory caching of user permissions to avoid
 * repeated database queries during permission checks.
 *
 * Features:
 * - TTL-based expiration
 * - Per-user invalidation
 * - Bulk invalidation by pool or copropiedad
 */
@Injectable()
export class PermissionsCacheService {
  private readonly logger = new Logger(PermissionsCacheService.name);
  private readonly cache = new Map<string, CachedUserPermissions>();
  private readonly ttlMs: number;

  constructor(private configService: ConfigService) {
    // Default TTL: 5 minutes
    this.ttlMs = this.configService.get<number>(
      'PERMISSIONS_CACHE_TTL_MS',
      300000,
    );
  }

  /**
   * Get cached permissions for a user
   *
   * @param userId - User ID to get permissions for
   * @returns Cached permissions or null if not cached/expired
   */
  get(userId: string): CachedUserPermissions | null {
    const cached = this.cache.get(userId);

    if (!cached) {
      return null;
    }

    // Check TTL expiration
    if (Date.now() - cached.cachedAt > this.ttlMs) {
      this.cache.delete(userId);
      return null;
    }

    return cached;
  }

  /**
   * Store permissions in cache
   *
   * @param userId - User ID to cache permissions for
   * @param permissions - Permissions to cache
   */
  set(
    userId: string,
    permissions: Omit<CachedUserPermissions, 'cachedAt'>,
  ): void {
    this.cache.set(userId, {
      ...permissions,
      cachedAt: Date.now(),
    });
  }

  /**
   * Invalidate cache for a specific user
   *
   * @param userId - User ID to invalidate
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
    this.logger.debug(`Cache invalidated for user: ${userId}`);
  }

  /**
   * Invalidate cache for multiple users
   *
   * @param userIds - Array of user IDs to invalidate
   */
  invalidateMany(userIds: string[]): void {
    for (const userId of userIds) {
      this.cache.delete(userId);
    }
    this.logger.debug(`Cache invalidated for ${userIds.length} users`);
  }

  /**
   * Clear all cached permissions
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.debug(`Cache cleared: ${size} entries removed`);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; ttlMs: number } {
    return {
      size: this.cache.size,
      ttlMs: this.ttlMs,
    };
  }
}
