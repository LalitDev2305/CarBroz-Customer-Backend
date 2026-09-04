import { describe, expect, it } from 'vitest';
import {
  ApplicationError,
  ForbiddenError,
  KernelError,
  NotFoundError,
} from '@carbroz/foundation-kernel';
import {
  AppError as LegacyAppError,
  ForbiddenError as LegacyForbiddenError,
  NotFoundError as LegacyNotFoundError,
} from './exceptions.js';

describe('legacy common error compatibility', () => {
  it('re-exports the exact Foundation constructors', () => {
    expect(LegacyAppError).toBe(ApplicationError);
    expect(LegacyForbiddenError).toBe(ForbiddenError);
    expect(LegacyNotFoundError).toBe(NotFoundError);
  });

  it('preserves instanceof and transport metadata for forbidden failures', () => {
    const error = new LegacyForbiddenError('admin only');

    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(KernelError);
    expect(error.statusCode).toBe(403);
    expect(error.errorCode).toBe('FORBIDDEN');
    expect(error.code).toBe('FORBIDDEN');
  });

  it('preserves not-found behavior through the compatibility facade', () => {
    const error = new NotFoundError('missing');

    expect(error).toBeInstanceOf(LegacyNotFoundError);
    expect(error.statusCode).toBe(404);
    expect(error.errorCode).toBe('NOT_FOUND');
    expect(error.code).toBe('NOT_FOUND');
  });
});
