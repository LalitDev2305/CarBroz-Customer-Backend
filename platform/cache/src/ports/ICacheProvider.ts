/** Canonical domain-neutral cache contract owned by platform/cache. */
export interface ICacheProvider {
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
  health?(): Promise<boolean>;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
