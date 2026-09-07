import { describe, expect, it, vi } from 'vitest';
import {
  DomainError,
  InternalServerError,
  NotFoundError,
} from '@carbroz/foundation-kernel';
import { ZodError } from 'zod';
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

describe('API error boundary', () => {
  it('preserves safe ApplicationError status/code while suppressing server-error detail', () => {
    const notFound = handle(new NotFoundError('Vehicle not found') as any);
    expect(notFound.res.statusCode).toBe(404);
    expect(notFound.res.body).toEqual({
      success: false,
      message: 'Vehicle not found',
      code: 'NOT_FOUND',
      traceId: 'trace-error-boundary',
    });
    expect(notFound.req.log.warn).toHaveBeenCalledOnce();

    const internal = handle(new InternalServerError('postgres://user:secret@db/internal') as any);
    expect(internal.res.statusCode).toBe(500);
    expect(internal.res.body).toEqual({
      success: false,
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      traceId: 'trace-error-boundary',
    });
    expect(JSON.stringify(internal.res.body)).not.toContain('secret');
    expect(internal.req.log.error).toHaveBeenCalledOnce();
  });

  it.each([
    ['BOOKING_UNAUTHORIZED', 'Authentication required', 401],
    ['BOOKING_FORBIDDEN', 'Booking access is forbidden', 403],
    ['BOOKING_NOT_FOUND', 'Booking not found or unauthorized', 404],
    ['BOOKING_SLOT_CONFLICT', 'Selected service slot is no longer available', 409],
    ['BOOKING_INVALID_SLOT', 'Slot start time must be in the future', 400],
  ])('maps DomainError %s to stable HTTP semantics', (code, message, statusCode) => {
    const { req, res } = handle(new DomainError(message, code) as any);
    expect(res.statusCode).toBe(statusCode);
    expect(res.body).toEqual({
      success: false,
      message,
      code,
      traceId: 'trace-error-boundary',
    });
    expect(req.log.warn).toHaveBeenCalledOnce();
  });

  it('maps legacy prefixed DomainError messages without exposing the prefix as message text', () => {
    const { res } = handle(
      new DomainError('FORBIDDEN: You do not have permission to manage these addresses') as any,
    );
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      success: false,
      message: 'You do not have permission to manage these addresses',
      code: 'FORBIDDEN',
      traceId: 'trace-error-boundary',
    });
  });

  it('contains Zod and Fastify schema details behind a stable validation response', () => {
    const zod = handle(new ZodError([]) as any);
    expect(zod.res.statusCode).toBe(400);
    expect(zod.res.body).toMatchObject({
      success: false,
      message: 'Invalid request data',
      code: 'VALIDATION_ERROR',
    });

    const schemaError = Object.assign(
      new Error('body/password must match secret internal schema'),
      { validation: [{ instancePath: '/password' }] },
    );
    const fastify = handle(schemaError as any);
    expect(fastify.res.statusCode).toBe(400);
    expect(fastify.res.body).toMatchObject({
      success: false,
      message: 'Invalid request data',
      code: 'VALIDATION_ERROR',
    });
    expect(JSON.stringify(fastify.res.body)).not.toContain('password');
    expect(JSON.stringify(fastify.res.body)).not.toContain('secret');
  });

  it('never reflects an unhandled exception message to the client', () => {
    const { req, res } = handle(
      new Error('Prisma connection failed for postgresql://user:secret@db/carbroz') as any,
    );
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      traceId: 'trace-error-boundary',
    });
    expect(JSON.stringify(res.body)).not.toContain('Prisma');
    expect(JSON.stringify(res.body)).not.toContain('secret');
    expect(req.log.error).toHaveBeenCalledOnce();
  });
});
