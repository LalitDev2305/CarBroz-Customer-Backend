export interface RedisCacheConfig {
    host?: string;
    port?: number;
    password?: string;
    keyPrefix?: string;
    defaultTtlSeconds?: number;
}
