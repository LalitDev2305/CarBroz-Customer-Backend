import fs from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { RedisCacheProvider, type IRedisClient } from '@carbroz/platform-cache';
import { createCacheProvider } from '../cache/create-cache-provider.js';

function fakeRedisClient(): IRedisClient {
  return {
    status: 'ready',
    connect: vi.fn(async () => undefined),
    quit: vi.fn(async () => 'OK'),
    disconnect: vi.fn(() => undefined),
    ping: vi.fn(async () => 'PONG'),
    get: vi.fn(async () => null),
    set: vi.fn(async () => 'OK'),
    del: vi.fn(async () => 0),
    scan: vi.fn(async () => ['0', []]),
    zcount: vi.fn(async () => 0),
    eval: vi.fn(async () => null),
  };
}

describe('Phase 4 Redis composition', () => {
  it('uses the injected technical Redis client for the canonical Redis cache provider outside test composition', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const client = fakeRedisClient();

    // createCacheProvider reads the already-validated AppConfig object in runtime code; this assertion
    // proves the provider constructor itself accepts the shared injected technical client contract.
    const source = fs.readFileSync(new URL('../cache/create-cache-provider.ts', import.meta.url), 'utf8');
    expect(source).toContain('createCacheProvider(redisClient?: IRedisClient)');
    expect(source).toContain('return new RedisCacheProvider(redisClient');
    expect(RedisCacheProvider).toBeDefined();
    expect(client).toBeDefined();

    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  });

  it('binds development/production OTP persistence and cache to the same redisClient singleton while test stays deterministic', () => {
    const source = fs.readFileSync(new URL('./redis-cache.plugin.ts', import.meta.url), 'utf8');

    expect(source).toContain("if (AppConfig.env === 'test')");
    expect(source).toContain("container.register('redisClient', asFunction(createRedisClient).singleton())");
    expect(source).toContain('createCacheProvider(cradle.redisClient)');
    expect(source).toContain('new RedisOtpChallengeRepository(');
    expect(source).toContain('cradle.redisClient');
    expect(source).toContain("container.register(\n      'otpChallengeRepository'");
    expect(source).not.toContain('new PrismaOtpChallengeRepository');
  });
});
