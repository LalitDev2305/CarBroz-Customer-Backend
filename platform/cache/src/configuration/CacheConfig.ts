/** Canonical Redis cache configuration consumed by platform/cache. */
export interface RedisCacheConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  keyPrefix?: string;
  defaultTtlSeconds?: number;
  connectTimeoutMs?: number;
  maxRetriesPerRequest?: number;
}
