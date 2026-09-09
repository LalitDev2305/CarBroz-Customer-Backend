import { describe, expect, it, vi } from 'vitest';
import type { IRedisClient } from '@carbroz/platform-cache';
import { RedisOtpChallengeRepository } from './RedisOtpChallengeRepository.js';

const NAMESPACE = 'carbroz:identity:otp:v1:';

type Entry = { value: string; expiresAt?: number };
type SortedSet = Map<string, number>;

class FakeAtomicRedisClient implements IRedisClient {
  readonly status = 'ready';
  private readonly values = new Map<string, Entry>();
  private readonly sortedSets = new Map<string, SortedSet>();
  private readonly sortedSetExpiry = new Map<string, number>();
  private sequence = 0;

  connect = vi.fn(async () => undefined);
  quit = vi.fn(async () => 'OK');
  disconnect = vi.fn(() => undefined);
  ping = vi.fn(async () => 'PONG');

  async get(key: string): Promise<string | null> {
    return this.getValue(key);
  }

  async set(key: string, value: string, ...args: Array<string | number>): Promise<unknown> {
    let expiresAt: number | undefined;
    const pxIndex = args.findIndex((arg) => arg === 'PX');
    if (pxIndex >= 0) expiresAt = Date.now() + Number(args[pxIndex + 1]);
    const exIndex = args.findIndex((arg) => arg === 'EX');
    if (exIndex >= 0) expiresAt = Date.now() + Number(args[exIndex + 1]) * 1000;
    this.values.set(key, expiresAt === undefined ? { value } : { value, expiresAt });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let removed = 0;
    for (const key of keys) if (this.values.delete(key)) removed += 1;
    return removed;
  }

  async scan(
    _cursor: string,
    _matchToken: 'MATCH',
    pattern: string,
    _countToken: 'COUNT',
    _count: number,
  ): Promise<[string, string[]]> {
    const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
    return ['0', [...this.values.keys()].filter((key) => key.startsWith(prefix))];
  }

  async zcount(key: string, min: string | number, max: string | number): Promise<number> {
    this.cleanupSortedSet(key);
    const set = this.sortedSets.get(key);
    if (!set) return 0;
    const lower = min === '-inf' ? Number.NEGATIVE_INFINITY : Number(min);
    const upper = max === '+inf' ? Number.POSITIVE_INFINITY : Number(max);
    return [...set.values()].filter((score) => score >= lower && score <= upper).length;
  }

  async eval(script: string, numberOfKeys: number, ...args: string[]): Promise<unknown> {
    const keys = args.slice(0, numberOfKeys);
    const argv = args.slice(numberOfKeys);

    if (script.includes('create-with-rate-limit:v1')) return this.evalCreate(argv);
    if (script.includes('record-failed-attempt:v1')) return this.evalFailedAttempt(keys, argv);
    if (script.includes('try-consume:v1')) return this.evalConsume(keys, argv);
    if (script.includes('invalidate:v1')) return this.evalInvalidate(keys, argv);
    throw new Error('unexpected script');
  }

  keys(): string[] {
    return [...this.values.keys(), ...this.sortedSets.keys()];
  }

  storedValues(): string[] {
    return [...this.values.values()].map((entry) => entry.value);
  }

  overwrite(key: string, value: string): void {
    const current = this.values.get(key);
    if (!current) throw new Error(`missing key ${key}`);
    this.values.set(key, current.expiresAt === undefined ? { value } : { value, expiresAt: current.expiresAt });
  }

  private evalCreate(argv: string[]): unknown {
    const [
      namespace,
      phoneKey,
      publicId,
      phoneNumber,
      deviceId,
      otpHash,
      maxAttemptsRaw,
      expiresAt,
      nowIso,
      nowMsRaw,
      windowStartMsRaw,
      maxChallengesRaw,
      challengeTtlMsRaw,
      rateTtlMsRaw,
    ] = argv;
    const nowMs = Number(nowMsRaw);
    const windowStartMs = Number(windowStartMsRaw);
    const maxChallenges = Number(maxChallengesRaw);
    const challengeTtlMs = Number(challengeTtlMsRaw);
    const rateTtlMs = Number(rateTtlMsRaw);
    const rateKey = `${namespace}rate:${phoneKey}`;

    this.cleanupSortedSet(rateKey);
    const set = this.sortedSets.get(rateKey) ?? new Map<string, number>();
    for (const [member, score] of set) if (score < windowStartMs) set.delete(member);
    if (set.size >= maxChallenges) return [0];

    const id = ++this.sequence;
    const record = {
      id,
      publicId,
      phoneNumber,
      deviceId,
      otpHash,
      attemptCount: 0,
      maxAttempts: Number(maxAttemptsRaw),
      expiresAt,
      consumedAt: null,
      invalidatedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const encoded = JSON.stringify(record);
    const expiresAtMs = Date.now() + challengeTtlMs;

    this.values.set(`${namespace}challenge:${id}`, { value: encoded, expiresAt: expiresAtMs });
    this.values.set(`${namespace}public:${publicId}`, { value: String(id), expiresAt: expiresAtMs });
    this.values.set(`${namespace}phone:${phoneKey}:latest`, { value: String(id), expiresAt: expiresAtMs });
    set.set(String(id), nowMs);
    this.sortedSets.set(rateKey, set);
    this.sortedSetExpiry.set(rateKey, Date.now() + rateTtlMs);
    return [1, String(id), encoded];
  }

  private evalFailedAttempt(keys: string[], argv: string[]): unknown {
    const raw = this.getValue(keys[0]!);
    if (!raw) return null;
    const record = JSON.parse(raw) as any;
    const maxAttempts = Number(argv[0]);
    if (record.consumedAt !== null || record.invalidatedAt !== null) return null;
    if (record.attemptCount >= maxAttempts) return null;
    record.attemptCount += 1;
    record.updatedAt = argv[1];
    this.replaceKeepingTtl(keys[0]!, JSON.stringify(record));
    return JSON.stringify(record);
  }

  private evalConsume(keys: string[], argv: string[]): unknown {
    const raw = this.getValue(keys[0]!);
    if (!raw) return 0;
    const record = JSON.parse(raw) as any;
    const nowMs = Number(argv[0]);
    const maxAttempts = Number(argv[1]);
    const expiresAtMs = Number(argv[2]);
    if (record.consumedAt !== null || record.invalidatedAt !== null) return 0;
    if (record.attemptCount >= maxAttempts || expiresAtMs <= nowMs) return 0;
    record.consumedAt = argv[3];
    record.updatedAt = argv[3];
    this.replaceKeepingTtl(keys[0]!, JSON.stringify(record));
    return 1;
  }

  private evalInvalidate(keys: string[], argv: string[]): unknown {
    const raw = this.getValue(keys[0]!);
    if (!raw) return 0;
    const record = JSON.parse(raw) as any;
    if (record.consumedAt !== null || record.invalidatedAt !== null) return 0;
    record.invalidatedAt = argv[0];
    record.updatedAt = argv[0];
    this.replaceKeepingTtl(keys[0]!, JSON.stringify(record));
    this.sortedSets.get(keys[1]!)?.delete(String(record.id));
    return 1;
  }

  private getValue(key: string): string | null {
    const entry = this.values.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
      this.values.delete(key);
      return null;
    }
    return entry.value;
  }

  private replaceKeepingTtl(key: string, value: string): void {
    const current = this.values.get(key);
    if (!current) return;
    this.values.set(key, current.expiresAt === undefined ? { value } : { value, expiresAt: current.expiresAt });
  }

  private cleanupSortedSet(key: string): void {
    const expiresAt = this.sortedSetExpiry.get(key);
    if (expiresAt !== undefined && expiresAt <= Date.now()) {
      this.sortedSetExpiry.delete(key);
      this.sortedSets.delete(key);
    }
  }
}

function createInput(now: Date, phoneNumber = '+919876543210') {
  return {
    phoneNumber,
    deviceId: 'device-1',
    otpHash: 'sha256:hash-only-value',
    maxAttempts: 5,
    expiresAt: new Date(now.getTime() + 300_000),
  };
}

function guard(now: Date, maxChallenges = 5) {
  return {
    now,
    windowStart: new Date(now.getTime() - 900_000),
    maxChallenges,
  };
}

describe('RedisOtpChallengeRepository', () => {
  it('round-trips challenge state, public lookup, latest lookup and rate count in the v1 namespace', async () => {
    const client = new FakeAtomicRedisClient();
    const repository = new RedisOtpChallengeRepository(client, { rateLimitWindowMs: 900_000 });
    const now = new Date('2026-09-09T09:30:00.000Z');

    const created = await repository.tryCreateWithinRateLimit(createInput(now), guard(now));
    expect(created).not.toBeNull();
    expect(created?.publicId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(created?.otpHash).toBe('sha256:hash-only-value');

    await expect(repository.findForVerification(created!.publicId, '+919876543210', 'device-1'))
      .resolves.toEqual(created);
    await expect(repository.findForVerification(created!.publicId, '+919876543210', 'wrong-device'))
      .resolves.toBeNull();
    await expect(repository.findLatestByPhone('+919876543210')).resolves.toEqual(created);
    await expect(repository.countCreatedSince('+919876543210', guard(now).windowStart)).resolves.toBe(1);

    expect(client.keys().every((key) => key.startsWith(NAMESPACE))).toBe(true);
    expect(client.storedValues().join('|')).not.toContain('123456');
  });

  it('atomically rejects concurrent creates that would exceed the rate-window maximum', async () => {
    const client = new FakeAtomicRedisClient();
    const repository = new RedisOtpChallengeRepository(client, { rateLimitWindowMs: 900_000 });
    const now = new Date('2026-09-09T09:31:00.000Z');

    const results = await Promise.all(
      Array.from({ length: 6 }, (_, index) => repository.tryCreateWithinRateLimit(
        createInput(now, '+911111111111'),
        guard(new Date(now.getTime() + index), 2),
      )),
    );

    expect(results.filter(Boolean)).toHaveLength(2);
    await expect(repository.countCreatedSince('+911111111111', guard(now).windowStart)).resolves.toBe(2);
  });

  it('increments failed attempts atomically and stops at the maximum', async () => {
    const client = new FakeAtomicRedisClient();
    const repository = new RedisOtpChallengeRepository(client, { rateLimitWindowMs: 900_000 });
    const now = new Date('2026-09-09T09:32:00.000Z');
    const challenge = (await repository.tryCreateWithinRateLimit(createInput(now), guard(now)))!;

    const updates = await Promise.all(
      Array.from({ length: 7 }, () => repository.recordFailedAttempt(challenge.id, 5)),
    );

    expect(updates.filter(Boolean)).toHaveLength(5);
    const latest = await repository.findLatestByPhone(challenge.phoneNumber);
    expect(latest?.attemptCount).toBe(5);
    await expect(repository.recordFailedAttempt(challenge.id, 5)).resolves.toBeNull();
  });

  it('allows exactly one concurrent consume and rejects replay/expired consume', async () => {
    const client = new FakeAtomicRedisClient();
    const repository = new RedisOtpChallengeRepository(client, { rateLimitWindowMs: 900_000 });
    const now = new Date('2026-09-09T09:33:00.000Z');
    const challenge = (await repository.tryCreateWithinRateLimit(createInput(now), guard(now)))!;

    const consumed = await Promise.all(
      Array.from({ length: 5 }, () => repository.tryConsume(challenge.id, new Date(now.getTime() + 1000), 5)),
    );
    expect(consumed.filter(Boolean)).toHaveLength(1);
    await expect(repository.tryConsume(challenge.id, new Date(now.getTime() + 2000), 5)).resolves.toBe(false);

    const later = new Date(now.getTime() + 10_000);
    const second = (await repository.tryCreateWithinRateLimit(createInput(later, '+912222222222'), guard(later)))!;
    await expect(repository.tryConsume(second.id, second.expiresAt, 5)).resolves.toBe(false);
  });

  it('invalidates idempotently, removes the challenge from rate counting and prevents consumption', async () => {
    const client = new FakeAtomicRedisClient();
    const repository = new RedisOtpChallengeRepository(client, { rateLimitWindowMs: 900_000 });
    const now = new Date('2026-09-09T09:34:00.000Z');
    const challenge = (await repository.tryCreateWithinRateLimit(createInput(now, '+913333333333'), guard(now)))!;

    await repository.invalidate(challenge.id, new Date(now.getTime() + 1000));
    await repository.invalidate(challenge.id, new Date(now.getTime() + 2000));

    const latest = await repository.findLatestByPhone(challenge.phoneNumber);
    expect(latest?.invalidatedAt?.toISOString()).toBe(new Date(now.getTime() + 1000).toISOString());
    await expect(repository.countCreatedSince(challenge.phoneNumber, guard(now).windowStart)).resolves.toBe(0);
    await expect(repository.tryConsume(challenge.id, new Date(now.getTime() + 3000), 5)).resolves.toBe(false);
  });

  it('fails closed on corrupt records and propagates Redis failures without fallback', async () => {
    const client = new FakeAtomicRedisClient();
    const repository = new RedisOtpChallengeRepository(client, { rateLimitWindowMs: 900_000 });
    const now = new Date('2026-09-09T09:35:00.000Z');
    const challenge = (await repository.tryCreateWithinRateLimit(createInput(now, '+914444444444'), guard(now)))!;

    client.overwrite(`${NAMESPACE}challenge:${challenge.id}`, '{bad-json');
    await expect(repository.findLatestByPhone(challenge.phoneNumber)).rejects.toThrow('corrupt');

    const failingClient = new FakeAtomicRedisClient();
    failingClient.eval = vi.fn(async () => { throw new Error('redis unavailable'); });
    const failingRepository = new RedisOtpChallengeRepository(failingClient, { rateLimitWindowMs: 900_000 });
    await expect(failingRepository.tryCreateWithinRateLimit(createInput(now), guard(now)))
      .rejects.toThrow('redis unavailable');
  });
});
