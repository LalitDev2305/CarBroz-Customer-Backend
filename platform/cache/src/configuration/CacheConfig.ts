/**
 * Domain-neutral behavior configuration consumed by RedisCacheProvider.
 *
 * Redis endpoint, credentials, TLS and connection/retry policy belong to the
 * executable composition root that creates the concrete vendor client.
 */
export interface RedisCacheConfig {
  keyPrefix?: string;
  defaultTtlSeconds?: number;
}
