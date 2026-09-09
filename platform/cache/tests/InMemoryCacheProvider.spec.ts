import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemoryCacheProvider } from '../src/providers/InMemoryCacheProvider.js';

describe('InMemoryCacheProvider', () => {
  let cache: InMemoryCacheProvider;

  beforeEach(() => {
    vi.useRealTimers();
    cache = new InMemoryCacheProvider();
  });

  it('should store and retrieve values', async () => {
    await cache.set('key1', 'value1');
    const result = await cache.get<string>('key1');
    expect(result).toBe('value1');
  });

  it('should return null for missing key', async () => {
    const result = await cache.get<string>('nonexistent');
    expect(result).toBeNull();
  });

  it('should handle TTL expiry', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    await cache.set('key_ttl', 'value_ttl', 1);
    await vi.advanceTimersByTimeAsync(1_001);
    expect(await cache.get<string>('key_ttl')).toBeNull();
    vi.useRealTimers();
  });

  it('should delete keys', async () => {
    await cache.set('key_del', 'value');
    await cache.delete('key_del');
    const result = await cache.get<string>('key_del');
    expect(result).toBeNull();
  });

  it('should clear all keys', async () => {
    await cache.set('k1', 'v1');
    await cache.set('k2', 'v2');
    await cache.clear();
    expect(await cache.get('k1')).toBeNull();
    expect(await cache.get('k2')).toBeNull();
  });
});
