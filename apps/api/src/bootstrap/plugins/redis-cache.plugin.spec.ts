import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Phase 4/11 Redis composition', () => {
  it('keeps concrete Redis creation at the executable boundary and injects that client into cache', () => {
    const source = fs.readFileSync(new URL('../cache/create-cache-provider.ts', import.meta.url), 'utf8');

    expect(source).toContain('export function createRedisClient(): IRedisClient');
    expect(source).toContain("if (AppConfig.env === 'test')");
    expect(source).toContain('new Redis(RedisConfig.url');
    expect(source).toContain('export function createCacheProvider(redisClient?: IRedisClient)');
    expect(source).toContain('return new RedisCacheProvider(redisClient');
    expect(source).toContain("if (!redisClient) throw new Error('Redis client is required outside NODE_ENV=test')");
  });

  it('binds development/production OTP persistence and cache to one redisClient while test uses an explicit in-memory adapter', () => {
    const source = fs.readFileSync(new URL('./redis-cache.plugin.ts', import.meta.url), 'utf8');

    expect(source).toContain("if (AppConfig.env === 'test')");
    expect(source).toContain('new InMemoryOtpChallengeRepository()');
    expect(source).toContain("container.register('redisClient', asFunction(createRedisClient).singleton())");
    expect(source).toContain('createCacheProvider(cradle.redisClient)');
    expect(source).toContain('new RedisOtpChallengeRepository(');
    expect(source).toContain('cradle.redisClient');
    expect(source).toContain("'otpChallengeRepository'");
    expect(source).not.toContain('PrismaOtpChallengeRepository');
  });

  it('keeps Identity module free of an alternate production OTP repository registration', () => {
    const source = fs.readFileSync(new URL('../../../../../domains/identity/identity.module.ts', import.meta.url), 'utf8');

    expect(source).not.toContain('PrismaOtpChallengeRepository');
    expect(source).not.toContain('otpChallengeRepository:');
  });

  it('keeps cache registration out of the generic DI plugin so Redis infrastructure owns production composition', () => {
    const source = fs.readFileSync(new URL('./di.plugin.ts', import.meta.url), 'utf8');

    expect(source).not.toContain('createCacheProvider');
    expect(source).not.toContain("container.register('cacheProvider'");
    expect(source).not.toContain('cacheProvider: asFunction');
  });
});
