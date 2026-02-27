import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Global cache module
 *
 * Provides in-memory caching via @nestjs/cache-manager.
 * Any module can inject CACHE_MANAGER to use the cache.
 *
 * Configuration:
 * - CACHE_TTL_MS: Default TTL in milliseconds (default: 300000 = 5 min)
 * - CACHE_MAX_ITEMS: Maximum number of items in cache (default: 1000)
 *
 * Usage:
 * ```typescript
 * import { CACHE_MANAGER } from '@nestjs/cache-manager';
 * import { Cache } from 'cache-manager';
 *
 * @Injectable()
 * export class MyService {
 *   constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
 *
 *   async getData(key: string) {
 *     const cached = await this.cache.get(key);
 *     if (cached) return cached;
 *     const data = await this.fetchFromDb();
 *     await this.cache.set(key, data, ttlMs);
 *     return data;
 *   }
 * }
 * ```
 */
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL_MS', 300000),
        max: configService.get<number>('CACHE_MAX_ITEMS', 1000),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
