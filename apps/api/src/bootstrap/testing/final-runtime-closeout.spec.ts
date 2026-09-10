import { describe, expect, it, vi } from 'vitest';
import { ApplicationError, DomainError } from '@carbroz/foundation-kernel';
import { ZodError, z } from 'zod';
import { InMemoryOtpChallengeRepository } from './InMemoryOtpChallengeRepository.js';
import { toExecutionContext } from '../lifecycle/toExecutionContext.js';
import { globalErrorHandler } from '../../transport/middleware/error-handler.js';

function reply() {
  const state: { status?: number; body?: unknown } = {};
  return {
    state,
    status(code: number) { state.status = code; return this; },
    code(code: number) { state.status = code; return this; },
    send(body: unknown) { state.body = body; return this; },
  } as any;
}

function request(overrides: Record<string, unknown> = {}) {
  return {
    id: 'request-1',
    traceId: 'trace-1',
    user: { id: '7', roles: ['CUSTOMER'] },
    log: { warn: vi.fn(), error: vi.fn() },
    ...overrides,
  } as any;
}

describe('API final runtime closeout behavior', () => {
  it('maps every execution-context actor role and rejects missing/invalid actors', () => {
    expect(() => toExecutionContext(request({ user: undefined }))).toThrow('UNAUTHENTICATED');
    expect(() => toExecutionContext(request({ user: { id: '0', roles: [] } }))).toThrow('valid actor id');
    expect(toExecutionContext(request({ user: { id: '1', roles: ['ADMIN'] } })).actor.kind).toBe('ADMIN');
    expect(toExecutionContext(request({ user: { id: '2', roles: ['PARTNER'] } })).actor.kind).toBe('PARTNER');
    expect(toExecutionContext(request({ user: { id: '3', roles: ['GUEST'] } })).actor.kind).toBe('GUEST');
    expect(toExecutionContext(request({ traceId: '', id: 'fallback', user: { id: '4', roles: [] } }))).toMatchObject({
      correlationId: 'fallback',
      actor: { id: 4, kind: 'CUSTOMER', roles: [] },
    });
  });

  it('covers the in-memory OTP challenge lifecycle and all guard branches', async () => {
    const repository = new InMemoryOtpChallengeRepository();
    const base = {
      phoneNumber: '9876543210', deviceId: 'device-1', otpHash: 'hash', maxAttempts: 2,
      expiresAt: new Date('2026-01-02T00:00:00.000Z'),
    };
    const first = await repository.create(base);
    expect(first.id).toBe(1);
    expect(await repository.findForVerification(first.publicId, base.phoneNumber, base.deviceId)).toMatchObject({ id: 1 });
    expect(await repository.findForVerification('missing', base.phoneNumber, base.deviceId)).toBeNull();
    expect(await repository.findLatestByPhone('missing')).toBeNull();
    expect(await repository.findLatestByPhone(base.phoneNumber)).toMatchObject({ id: 1 });
    expect(await repository.countCreatedSince(base.phoneNumber, new Date('2025-01-01'))).toBe(1);

    const now = new Date('2026-01-01T00:00:00.000Z');
    expect(await repository.tryCreateWithinRateLimit(base, { windowStart: new Date('2025-01-01'), maxChallenges: 1, now })).toBeNull();
    const other = await repository.tryCreateWithinRateLimit({ ...base, phoneNumber: '9999999999' }, { windowStart: new Date('2025-01-01'), maxChallenges: 2, now });
    expect(other).not.toBeNull();

    expect(await repository.recordFailedAttempt(999, 2)).toBeNull();
    const failed = await repository.recordFailedAttempt(first.id, 2);
    expect(failed?.attemptCount).toBe(1);
    const failedAgain = await repository.recordFailedAttempt(first.id, 1);
    expect(failedAgain).toBeNull();

    expect(await repository.tryConsume(999, now, 2)).toBe(false);
    expect(await repository.tryConsume(first.id, new Date('2026-01-03'), 2)).toBe(false);
    expect(await repository.tryConsume(first.id, now, 1)).toBe(false);
    expect(await repository.tryConsume(first.id, now, 2)).toBe(true);
    expect(await repository.tryConsume(first.id, now, 2)).toBe(false);
    await repository.invalidate(first.id, now);

    const active = await repository.create({ ...base, phoneNumber: '8888888888' });
    await repository.invalidate(active.id, now);
    expect(await repository.recordFailedAttempt(active.id, 2)).toBeNull();
    expect(await repository.tryConsume(active.id, now, 2)).toBe(false);
    await repository.invalidate(active.id, now);
  });

  it('maps application, domain, validation, access and unknown errors to safe transport envelopes', () => {
    const oldEnv = process.env.CARBROZ_ENVIRONMENT;
    process.env.CARBROZ_ENVIRONMENT = 'production';
    try {
      const appReply = reply();
      globalErrorHandler(new ApplicationError('Bad input', 418, 'APP_BAD') as any, request(), appReply);
      expect(appReply.state.status).toBe(400);

      const serverReply = reply();
      globalErrorHandler(new ApplicationError('secret', 503, 'UPSTREAM') as any, request(), serverReply);
      expect(serverReply.state.status).toBe(503);
      expect(JSON.stringify(serverReply.state.body)).not.toContain('secret');

      for (const [message, code, status] of [
        ['Denied', 'UNAUTHORIZED', 401],
        ['Denied', 'ORDER_FORBIDDEN', 403],
        ['Gone', 'ITEM_NOT_FOUND', 404],
        ['Exists', 'EMAIL_CONFLICT', 409],
        ['Rule failed', 'BUSINESS_RULE', 422],
      ] as const) {
        const r = reply();
        globalErrorHandler(new DomainError(message, code) as any, request(), r);
        expect(r.state.status).toBe(status);
      }

      const prefixed = reply();
      globalErrorHandler(new DomainError('ORDER_NOT_FOUND: Missing order') as any, request(), prefixed);
      expect(prefixed.state.status).toBe(404);
      expect(JSON.stringify(prefixed.state.body)).toContain('ORDER_NOT_FOUND');

      const emptyPrefix = reply();
      globalErrorHandler(new DomainError('ORDER_NOT_FOUND:   ') as any, request(), emptyPrefix);
      expect(emptyPrefix.state.status).toBe(404);

      const zodReply = reply();
      let zodError: ZodError;
      try { z.string().min(2).parse('x'); throw new Error('expected validation error'); } catch (error) { zodError = error as ZodError; }
      globalErrorHandler(zodError! as any, request(), zodReply);
      expect(zodReply.state.status).toBe(400);

      const schemaReply = reply();
      globalErrorHandler(Object.assign(new Error('schema details'), { validation: [{}] }) as any, request(), schemaReply);
      expect(schemaReply.state.status).toBe(400);

      for (const status of [401, 403] as const) {
        const r = reply();
        globalErrorHandler(Object.assign(new Error('plugin detail'), { statusCode: status }) as any, request(), r);
        expect(r.state.status).toBe(status);
        expect(JSON.stringify(r.state.body)).not.toContain('plugin detail');
      }

      const unknown = reply();
      globalErrorHandler(new Error('database password') as any, request(), unknown);
      expect(unknown.state.status).toBe(500);
      expect(JSON.stringify(unknown.state.body)).not.toContain('database password');
    } finally {
      if (oldEnv === undefined) delete process.env.CARBROZ_ENVIRONMENT;
      else process.env.CARBROZ_ENVIRONMENT = oldEnv;
    }
  });
});
