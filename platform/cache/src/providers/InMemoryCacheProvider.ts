import type { ICacheProvider } from '../ports/ICacheProvider.js';

/** Deterministic in-process cache used by tests and explicitly local scenarios only. */
export class InMemoryCacheProvider implements ICacheProvider {
  private readonly cache = new Map<string, { value: unknown; expiresAt?: number }>();

  async health(): Promise<boolean> {
    return true;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const entry: { value: unknown; expiresAt?: number } = { value };
    if (ttlSeconds !== undefined) {
      if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
        throw new RangeError('ttlSeconds must be a positive integer when provided');
      }
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
