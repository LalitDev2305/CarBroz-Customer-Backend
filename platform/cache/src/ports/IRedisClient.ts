/**
 * Minimal Redis client surface required by platform/cache.
 *
 * The concrete vendor client is supplied by the executable composition root.
 * This keeps platform/cache independently testable without exposing vendor types
 * through domain/application layers.
 */
export interface IRedisClient {
  readonly status: string;
  connect(): Promise<void>;
  quit(): Promise<unknown>;
  disconnect(reconnect?: boolean): void;
  ping(): Promise<string>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: Array<string | number>): Promise<unknown>;
  del(...keys: string[]): Promise<number>;
  scan(
    cursor: string,
    matchToken: 'MATCH',
    pattern: string,
    countToken: 'COUNT',
    count: number,
  ): Promise<[string, string[]]>;
}
