import { describe, expect, it } from 'vitest';
import {
  AppError as LegacyAppError,
  ForbiddenError as LegacyForbiddenError,
  NotFoundError as LegacyNotFoundError,
} from '@carbroz/common';
import {
  ApplicationError,
  ForbiddenError,
  KernelError,
  NotFoundError,
} from '@carbroz/foundation-kernel';

describe('Foundation error ownership migration', () => {
  it('preserves one constructor identity through the transitional common facade', () => {
    expect(LegacyAppError).toBe(ApplicationError);
    expect(LegacyForbiddenError).toBe(ForbiddenError);
    expect(LegacyNotFoundError).toBe(NotFoundError);
  });

  it('preserves legacy instanceof behavior while canonical ownership moves to Foundation', () => {
    const error = new LegacyForbiddenError('admin only');

    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(KernelError);
    expect(error.statusCode).toBe(403);
    expect(error.errorCode).toBe('FORBIDDEN');
    expect(error.code).toBe('FORBIDDEN');
  });

  it('preserves not-found transport metadata without duplicating the class hierarchy', () => {
    const error = new NotFoundError('missing');

    expect(error).toBeInstanceOf(LegacyNotFoundError);
    expect(error.statusCode).toBe(404);
    expect(error.errorCode).toBe('NOT_FOUND');
    expect(error.code).toBe('NOT_FOUND');
  });
});
