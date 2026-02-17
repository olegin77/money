import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Cache helpers
  generateUserCacheKey(userId: string, prefix: string): string {
    return `user:${userId}:${prefix}`;
  }

  generateDashboardCacheKey(userId: string, period: string): string {
    return `dashboard:${userId}:${period}`;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `user:${userId}:*`,
      `dashboard:${userId}:*`,
      `expenses:${userId}:*`,
      `income:${userId}:*`,
    ];

    for (const pattern of patterns) {
      await this.del(pattern);
    }
  }
}
