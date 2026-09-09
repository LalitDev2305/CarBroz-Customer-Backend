import { Redis } from 'ioredis';
import {
  InMemoryCacheProvider,
  RedisCacheProvider,
  type ICacheProvider,
  type IRedisClient,
} from '@carbroz/platform-cache';
import { AppConfig, RedisConfig } from '../config/runtime-config.js';

const REDIS_CACHE_PREFIX = 'carbroz:cache:';

/**
 * Composition-root factory for the single canonical cache provider.
 * Production/development use Redis. Tests stay deterministic and never silently
 * alter production behavior because the in-memory provider is selected only for NODE_ENV=test.
 */
export function createCacheProvider(): ICacheProvider {
  if (AppConfig.env === 'test') return new InMemoryCacheProvider();

  const client = new Redis(RedisConfig.url, {
    lazyConnect: true,
    enableReadyCheck: true,
    connectTimeout: 5_000,
    maxRetriesPerRequest: 1,
    retryStrategy(attempt: number) {
      return Math.min(attempt * 100, 2_000);
    },
  });

  return new RedisCacheProvider(client as unknown as IRedisClient, {
    keyPrefix: REDIS_CACHE_PREFIX,
  });
}
