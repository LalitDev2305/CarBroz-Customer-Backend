import { Redis } from 'ioredis';
import {
  InMemoryCacheProvider,
  RedisCacheProvider,
  type ICacheProvider,
  type IRedisClient,
} from '@carbroz/platform-cache';
import { AppConfig, RedisConfig } from '../config/runtime-config.js';

const REDIS_CACHE_PREFIX = 'carbroz:cache:';

/** Creates the single concrete Redis technical client owned by the executable composition root. */
export function createRedisClient(): IRedisClient {
  if (AppConfig.env === 'test') {
    throw new Error('Concrete Redis client is not created for NODE_ENV=test');
  }

  return new Redis(RedisConfig.url, {
    lazyConnect: true,
    enableReadyCheck: true,
    connectTimeout: 5_000,
    maxRetriesPerRequest: 1,
    retryStrategy(attempt: number) {
      return Math.min(attempt * 100, 2_000);
    },
  }) as unknown as IRedisClient;
}

/**
 * Composition-root factory for the single canonical cache provider.
 * Production/development reuse the shared Redis client. Tests stay deterministic and never silently
 * alter production behavior because the in-memory provider is selected only for NODE_ENV=test.
 */
export function createCacheProvider(redisClient?: IRedisClient): ICacheProvider {
  if (AppConfig.env === 'test') return new InMemoryCacheProvider();
  if (!redisClient) throw new Error('Redis client is required outside NODE_ENV=test');

  return new RedisCacheProvider(redisClient, {
    keyPrefix: REDIS_CACHE_PREFIX,
  });
}
