/** RedisCacheConfig is an exported platform/cache contract/implementation; see the owning README for lifecycle and extension rules. */
export interface RedisCacheConfig {
  host?: string;
  port?: number;
  password?: string;
  keyPrefix?: string;
  defaultTtlSeconds?: number;
}
