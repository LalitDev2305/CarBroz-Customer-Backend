import { describe, expect, it, vi } from 'vitest';
import {
  ApplicationError,
  DomainError,
  InternalServerError,
  NotFoundError,
} from '@carbroz/foundation-kernel';
import { globalErrorHandler } from '../../apps/api/src/transport/middleware/error-handler.js';

function request() {
  return {
    traceId: 'trace-error-boundary',
    log: {
      warn: vi.fn(),
      error: vi.fn(),
    },
  } as any;
}

function reply() {
  const value: any = {
    statusCode: undefined,
    body: undefined,
  };
  value.status = vi.fn((statusCode: number) => {
    value.statusCode = statusCode;
    return value;
  });
  value.send = vi.fn((body: unknown) => {
    value.body = body;
    return value;
  });
  return value;
}

function handle(error: Error & Record<string, unknown>) {
  const req = request();
  const res = reply();
  globalErrorHandler(error as any, req, res);
  return { req, res };
}

function expectCanonicalError(
  res: ReturnType<typeof reply>,
  expected: { status: number; code: string; message: string },
) {
  expect(res.statusCode).toBe(expected.status);
  expect(res.body).toEqual({
    status: expected.status,
    code: expected.code,
    message: expected.message,
    data: null,
    traceId: 'trace-error-boundary',
  });
}

describe('API error boundary', () => {
  it('preserves safe ApplicationError status/code while suppressing server-error detail', () => {
    const notFound = handle(new NotFoundError('Vehicle not found') as any);
    expectCanonicalError(notFound.res, {
      status: 404,
      code: 'NOT_FOUND',
      message: 'Vehicle not found',
    });
    expect(notFound.req.log.warn).toHaveBeenCalledOnce();

    const internal = handle(new InternalServerError('postgres://user:secret@db/internal') as any);
    expectCanonicalError(internal.res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
    });
    expect(JSON.stringify(internal.res.body)).not.toContain('secret');
    expect(internal.req.log.error).toHaveBeenCalledOnce();
  });

  it('supports fail-closed dependency failures with HTTP/body 503 and a stable application code', () => {
    const dependency = handle(
      new ApplicationError('redis://user:secret@redis/internal', 503, 'OTP_PERSISTENCE_UNAVAILABLE') as any,
    );
    expectCanonicalError(dependency.res, {
      status: 503,
      code: 'OTP_PERSISTENCE_UNAVAILABLE',
      message: 'Something went wrong. Please try again later.',
    });
    expect(JSON.stringify(dependency.res.body)).not.toContain('secret');
    expect(dependency.req.log.error).toHaveBeenCalledOnce();
  });

  it.each([
    ['BOOKING_UNAUTHORIZED', 'Authentication required', 401],
    ['BOOKING_FORBIDDEN', 'Booking access is forbidden', 403],
    ['BOOKING_NOT_FOUND', 'Booking not found or unauthorized', 404],
    ['BOOKING_SLOT_CONFLICT', 'Selected service slot is no longer available', 409],
    ['BOOKING_INVALID_SLOT', 'Slot start time must be in the future', 422],
  ])('maps DomainError %s to stable HTTP semantics', (code, message, statusCode) => {
    const { req, res } = handle(new DomainError(message, code) as any);
    expectCanonicalError(res, { status: statusCode, code, message });
    expect(req.log.warn).toHaveBeenCalledOnce();
  });

  it('maps legacy prefixed DomainError messages without exposing the prefix as message text', () => {
    const { res } = handle(
      new DomainError('FORBIDDEN: You do not have permission to manage these addresses') as any,
    );
    expectCanonicalError(res, {
      status: 403,
      code: 'FORBIDDEN',
      message: 'You do not have permission to manage these addresses',
    });
  });

  it('contains Fastify schema details behind a stable validation response', () => {
    const schemaError = Object.assign(
      new Error('body/password must match secret internal schema'),
      { validation: [{ instancePath: '/password' }] },
    );
    const fastify = handle(schemaError as any);
    expectCanonicalError(fastify.res, {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'The request contains invalid information.',
    });
    expect(JSON.stringify(fastify.res.body)).not.toContain('password');
    expect(JSON.stringify(fastify.res.body)).not.toContain('secret');
  });

  it('never reflects an unhandled exception message to the client', () => {
    const { req, res } = handle(
      new Error('Prisma connection failed for postgresql://user:secret@db/carbroz') as any,
    );
    expectCanonicalError(res, {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong. Please try again later.',
    });
    expect(JSON.stringify(res.body)).not.toContain('Prisma');
    expect(JSON.stringify(res.body)).not.toContain('secret');
    expect(req.log.error).toHaveBeenCalledOnce();
  });
});
