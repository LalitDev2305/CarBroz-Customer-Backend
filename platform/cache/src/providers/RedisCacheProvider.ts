import type { RedisCacheConfig } from '../configuration/CacheConfig.js';
import type { ICacheProvider } from '../ports/ICacheProvider.js';
import type { IRedisClient } from '../ports/IRedisClient.js';

const DEFAULT_KEY_PREFIX = 'carbroz:cache:';
const DEFAULT_SCAN_COUNT = 100;

/** Canonical Redis-backed implementation of the domain-neutral cache contract. */
export class RedisCacheProvider implements ICacheProvider {
  private readonly keyPrefix: string;
  private readonly defaultTtlSeconds: number | undefined;

  constructor(
    private readonly client: IRedisClient,
    config: RedisCacheConfig = {},
  ) {
    this.keyPrefix = normalizeKeyPrefix(config.keyPrefix ?? DEFAULT_KEY_PREFIX);
    this.defaultTtlSeconds = normalizeOptionalTtl(config.defaultTtlSeconds);
  }

  async initialize(): Promise<void> {
    if (this.client.status === 'wait' || this.client.status === 'end') {
      await this.client.connect();
    }

    const healthy = await this.health();
    if (!healthy) throw new Error('Redis cache provider failed health verification during initialization');
  }

  async shutdown(): Promise<void> {
    if (this.client.status === 'end') return;

    try {
      await this.client.quit();
    } catch {
      this.client.disconnect(false);
    }
  }

  async health(): Promise<boolean> {
    try {
      return (await this.client.ping()).toUpperCase() === 'PONG';
    } catch {
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(this.toRedisKey(key));
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      throw new TypeError('Cache values must be JSON serializable');
    }

    const ttl = normalizeOptionalTtl(ttlSeconds) ?? this.defaultTtlSeconds;
    const redisKey = this.toRedisKey(key);

    if (ttl !== undefined) {
      await this.client.set(redisKey, serialized, 'EX', ttl);
      return;
    }

    await this.client.set(redisKey, serialized);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(this.toRedisKey(key));
  }

  /**
   * Clears only keys owned by this provider prefix.
   * Never flushes the Redis database because Redis is shared with other platform capabilities.
   */
  async clear(): Promise<void> {
    let cursor = '0';
    const pattern = `${this.keyPrefix}*`;

    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        DEFAULT_SCAN_COUNT,
      );
      cursor = nextCursor;
      if (keys.length > 0) await this.client.del(...keys);
    } while (cursor !== '0');
  }

  private toRedisKey(key: string): string {
    const normalized = key.trim();
    if (!normalized) throw new Error('Cache key must not be empty');
    return `${this.keyPrefix}${normalized}`;
  }
}

function normalizeKeyPrefix(prefix: string): string {
  const normalized = prefix.trim();
  if (!normalized) throw new Error('Redis cache keyPrefix must not be empty');
  return normalized.endsWith(':') ? normalized : `${normalized}:`;
}

function normalizeOptionalTtl(ttlSeconds: number | undefined): number | undefined {
  if (ttlSeconds === undefined) return undefined;
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
    throw new RangeError('ttlSeconds must be a positive integer when provided');
  }
  return ttlSeconds;
}
