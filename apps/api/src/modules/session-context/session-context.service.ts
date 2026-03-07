import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { UsersService } from '../users/users.service';
import { UserStateService } from '../user-state/user-state.service';
const CACHE_KEY_PREFIX = 'session-context';

/**
 * Reference object typed as ResolvedSessionContext.
 * TypeScript enforces this stays in sync with the interface —
 * if fields are added/removed, this will cause a compile error.
 */
const SESSION_CONTEXT_SCHEMA: ResolvedSessionContext = {
  userId: '',
  userEmail: '',
  userFirstName: '',
  userLastName: '',
  isSuperAdmin: false,
  userStateTheme: '',
  userStateLanguage: '',
  userStateSidebarCollapsed: false,
};

/**
 * Resolved session context for a user
 */
export interface ResolvedSessionContext {
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  isSuperAdmin: boolean;
  userStateTheme: string;
  userStateLanguage: string;
  userStateSidebarCollapsed: boolean;
}

/**
 * Service for assembling user session context
 *
 * Gathers data from multiple sources (User, UserState, Condominium)
 * and returns a flat object with all resolved values.
 *
 * Results are cached per-user with configurable TTL.
 * Cache is invalidated when user state changes.
 */
@Injectable()
export class SessionContextService {
  private readonly logger = new Logger(SessionContextService.name);
  private readonly ttlMs: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly userStateService: UserStateService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    this.ttlMs = this.configService.get<number>(
      'SESSION_CONTEXT_CACHE_TTL_MS',
      300000, // 5 minutes default
    );
  }

  /**
   * Resolve the full session context for a user
   *
   * Checks cache first, resolves from DB on miss.
   */
  async getContext(userId: string): Promise<ResolvedSessionContext> {
    const cacheKey = `${CACHE_KEY_PREFIX}:${userId}`;

    // Check cache
    const cached = await this.cache.get<ResolvedSessionContext>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for user: ${userId}`);
      return cached;
    }

    // Resolve from DB
    const context = await this.resolveContext(userId);

    // Store in cache
    await this.cache.set(cacheKey, context, this.ttlMs);
    this.logger.debug(`Cache set for user: ${userId} (TTL: ${this.ttlMs}ms)`);

    return context;
  }

  /**
   * Get session context metadata (field names and types)
   *
   * Returns the static schema derived from ResolvedSessionContext.
   * Cached globally (not per-user) since the schema is static.
   */
  async getMetadata(): Promise<{ fields: { name: string; type: string }[] }> {
    const cacheKey = `${CACHE_KEY_PREFIX}:metadata`;

    const cached = await this.cache.get<{ fields: { name: string; type: string }[] }>(cacheKey);
    if (cached) {
      this.logger.debug('Metadata cache hit');
      return cached;
    }

    const fields = Object.entries(SESSION_CONTEXT_SCHEMA).map(([name, value]) => ({
      name,
      type: typeof value,
    }));

    const metadata = { fields };
    await this.cache.set(cacheKey, metadata, this.ttlMs);
    this.logger.debug('Metadata cache set');

    return metadata;
  }

  /**
   * Invalidate cached session context for a user
   *
   * Call this when user data, preferences, or condominium selection changes.
   */
  async invalidateContext(userId: string): Promise<void> {
    const cacheKey = `${CACHE_KEY_PREFIX}:${userId}`;
    await this.cache.del(cacheKey);
    this.logger.debug(`Cache invalidated for user: ${userId}`);
  }

  /**
   * Resolve context from database sources
   */
  private async resolveContext(userId: string): Promise<ResolvedSessionContext> {
    // Load user
    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for session context: ${userId}`);
      return this.emptyContext(userId);
    }

    // Load user state (preferences)
    const userState = await this.userStateService.getOrCreate(userId);

    return {
      userId: user.id,
      userEmail: user.email,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin,
      userStateTheme: userState.theme,
      userStateLanguage: userState.language,
      userStateSidebarCollapsed: userState.sidebarCollapsed,
    };
  }

  private emptyContext(userId: string): ResolvedSessionContext {
    return {
      userId,
      userEmail: '',
      userFirstName: '',
      userLastName: '',
      isSuperAdmin: false,
      userStateTheme: 'system',
      userStateLanguage: 'es',
      userStateSidebarCollapsed: false,
    };
  }
}
