import { describe, expect, it, vi } from 'vitest';
import { RedisCacheProvider } from '../src/providers/RedisCacheProvider.js';
import type { IRedisClient } from '../src/ports/IRedisClient.js';

function fakeRedis(initialStatus = 'ready') {
  const values = new Map<string, string>();
  let status = initialStatus;

  const client: IRedisClient = {
    get status() { return status; },
    connect: vi.fn(async () => { status = 'ready'; }),
    quit: vi.fn(async () => { status = 'end'; return 'OK'; }),
    disconnect: vi.fn(() => { status = 'end'; }),
    ping: vi.fn(async () => 'PONG'),
    get: vi.fn(async (key: string) => values.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => { values.set(key, value); return 'OK'; }),
    del: vi.fn(async (...keys: string[]) => {
      let removed = 0;
      for (const key of keys) if (values.delete(key)) removed += 1;
      return removed;
    }),
    scan: vi.fn(async (_cursor: string, _match: 'MATCH', pattern: string) => {
      const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
      return ['0', [...values.keys()].filter((key) => key.startsWith(prefix))];
    }),
    zcount: vi.fn(async () => 0),
    eval: vi.fn(async () => null),
  };

  return { client, values };
}

describe('RedisCacheProvider', () => {
  it('serializes values behind the configured namespace and restores typed values', async () => {
    const { client, values } = fakeRedis();
    const provider = new RedisCacheProvider(client, { keyPrefix: 'carbroz:test' });

    await provider.set('sample', { enabled: true });

    expect(values.get('carbroz:test:sample')).toBe('{"enabled":true}');
    await expect(provider.get<{ enabled: boolean }>('sample')).resolves.toEqual({ enabled: true });
  });

  it('uses explicit TTL first and configured default TTL otherwise', async () => {
    const { client } = fakeRedis();
    const provider = new RedisCacheProvider(client, { defaultTtlSeconds: 60 });

    await provider.set('explicit', 'value', 5);
    await provider.set('default', 'value');

    expect(client.set).toHaveBeenNthCalledWith(1, 'carbroz:cache:explicit', '"value"', 'EX', 5);
    expect(client.set).toHaveBeenNthCalledWith(2, 'carbroz:cache:default', '"value"', 'EX', 60);
  });

  it('clears only provider-owned keys and never flushes the shared Redis database', async () => {
    const { client, values } = fakeRedis();
    values.set('carbroz:cache:a', '1');
    values.set('carbroz:cache:b', '2');
    values.set('bullmq:queue:job', '3');
    const provider = new RedisCacheProvider(client);

    await provider.clear();

    expect(values.has('carbroz:cache:a')).toBe(false);
    expect(values.has('carbroz:cache:b')).toBe(false);
    expect(values.get('bullmq:queue:job')).toBe('3');
  });

  it('connects lazily, verifies health, and closes gracefully', async () => {
    const { client } = fakeRedis('wait');
    const provider = new RedisCacheProvider(client);

    await provider.initialize();
    expect(client.connect).toHaveBeenCalledOnce();
    expect(client.ping).toHaveBeenCalled();
    await expect(provider.health()).resolves.toBe(true);

    await provider.shutdown();
    expect(client.quit).toHaveBeenCalledOnce();
  });

  it('fails startup closed when Redis cannot pass health verification', async () => {
    const { client } = fakeRedis('wait');
    vi.mocked(client.ping).mockRejectedValueOnce(new Error('redis unavailable'));
    const provider = new RedisCacheProvider(client);

    await expect(provider.initialize()).rejects.toThrow(
      'Redis cache provider failed health verification during initialization',
    );
    expect(client.connect).toHaveBeenCalledOnce();
  });

  it('fails health closed when Redis ping fails', async () => {
    const { client } = fakeRedis();
    vi.mocked(client.ping).mockRejectedValueOnce(new Error('redis unavailable'));
    const provider = new RedisCacheProvider(client);

    await expect(provider.health()).resolves.toBe(false);
  });

  it('forces disconnect when graceful Redis shutdown fails', async () => {
    const { client } = fakeRedis();
    vi.mocked(client.quit).mockRejectedValueOnce(new Error('quit failed'));
    const provider = new RedisCacheProvider(client);

    await provider.shutdown();

    expect(client.disconnect).toHaveBeenCalledWith(false);
  });

  it('is a no-op when Redis is already closed and returns null for cache misses', async () => {
    const { client } = fakeRedis('end');
    const provider = new RedisCacheProvider(client);

    await expect(provider.shutdown()).resolves.toBeUndefined();
    expect(client.quit).not.toHaveBeenCalled();
    await expect(provider.get('missing')).resolves.toBeNull();
  });

  it('supports non-expiring values and rejects non-serializable undefined values', async () => {
    const { client } = fakeRedis();
    const provider = new RedisCacheProvider(client);

    await provider.set('permanent', 'value');
    expect(client.set).toHaveBeenCalledWith('carbroz:cache:permanent', '"value"');
    await expect(provider.set('undefined', undefined)).rejects.toThrow('Cache values must be JSON serializable');
  });

  it('rejects an empty cache namespace at construction time', () => {
    const { client } = fakeRedis();
    expect(() => new RedisCacheProvider(client, { keyPrefix: '   ' })).toThrow('Redis cache keyPrefix must not be empty');
  });

  it('rejects invalid TTLs and empty keys before issuing Redis commands', async () => {
    const { client } = fakeRedis();
    const provider = new RedisCacheProvider(client);

    await expect(provider.set('x', 'value', 0)).rejects.toThrow('ttlSeconds');
    await expect(provider.get('   ')).rejects.toThrow('Cache key must not be empty');
    expect(client.get).not.toHaveBeenCalled();
  });
});
