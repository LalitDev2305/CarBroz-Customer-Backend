import { describe, expect, it } from 'vitest';
import { Entity } from '../../foundation/kernel/src/domain/base/Entity.js';
import { AggregateRoot } from '../../foundation/kernel/src/domain/base/AggregateRoot.js';
import type { IDomainEvent } from '../../foundation/kernel/src/domain/base/IDomainEvent.js';
import { Result } from '../../foundation/kernel/src/domain/base/Result.js';
import { DomainError } from '../../foundation/kernel/src/domain/errors/DomainError.js';
import {
  ApplicationError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  KernelError,
  KernelErrorCode,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../foundation/kernel/src/errors/errors.js';

class TestEntity extends Entity<number> {}

class TestAggregate extends AggregateRoot<number> {
  record(event: IDomainEvent): void {
    this.addDomainEvent(event);
  }
}

class TestDomainError extends DomainError {}

class TestKernelError extends KernelError {}

describe('Foundation kernel executable contracts', () => {
  it('preserves entity identity, timestamps and equality semantics', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const entity = new TestEntity(7, createdAt, updatedAt);

    expect(entity.id).toBe(7);
    expect(entity.createdAt).toBe(createdAt);
    expect(entity.updatedAt).toBe(updatedAt);
    expect(entity.equals()).toBe(false);
    expect(entity.equals(entity)).toBe(true);
    expect(entity.equals(new TestEntity(7))).toBe(true);
    expect(entity.equals(new TestEntity(8))).toBe(false);
  });

  it('protects aggregate event storage and clears recorded events', () => {
    const aggregate = new TestAggregate(1);
    const event: IDomainEvent = {
      eventName: 'foundation.test.recorded',
      occurredOn: new Date('2026-01-03T00:00:00.000Z'),
    };

    aggregate.record(event);
    const snapshot = aggregate.domainEvents;
    expect(snapshot).toEqual([event]);

    (snapshot as IDomainEvent[]).push({ ...event, eventName: 'mutated.snapshot' });
    expect(aggregate.domainEvents).toEqual([event]);

    aggregate.clearEvents();
    expect(aggregate.domainEvents).toEqual([]);
  });

  it('enforces Result success and failure access invariants', () => {
    const success = Result.ok<number, string>(42);
    expect(success.isSuccess).toBe(true);
    expect(success.isFailure).toBe(false);
    expect(success.getValue()).toBe(42);
    expect(() => success.getError()).toThrow('Cannot get error from a successful Result.');

    const emptySuccess = Result.ok<void, string>();
    expect(emptySuccess.getValue()).toBeUndefined();

    const failure = Result.fail<number, string>('invalid');
    expect(failure.isSuccess).toBe(false);
    expect(failure.isFailure).toBe(true);
    expect(failure.getError()).toBe('invalid');
    expect(() => failure.getValue()).toThrow('Cannot get value from a failed Result. Use getError() instead.');
  });

  it('preserves DomainError identity, default code and custom code', () => {
    const defaultError = new TestDomainError('broken');
    expect(defaultError).toBeInstanceOf(Error);
    expect(defaultError).toBeInstanceOf(DomainError);
    expect(defaultError.name).toBe('TestDomainError');
    expect(defaultError.message).toBe('broken');
    expect(defaultError.code).toBe('DOMAIN_ERROR');

    const customError = new TestDomainError('missing', 'CUSTOM_DOMAIN_ERROR');
    expect(customError.code).toBe('CUSTOM_DOMAIN_ERROR');
  });

  it('preserves the universal kernel error shape and subclass prototype', () => {
    const details = { field: 'phone' };
    const defaultError = new TestKernelError(KernelErrorCode.INTERNAL_ERROR, 'failed');
    expect(defaultError.name).toBe('TestKernelError');
    expect(defaultError.statusCode).toBe(500);
    expect(defaultError.details).toBeUndefined();

    const error = new TestKernelError(KernelErrorCode.INVALID_INPUT, 'invalid', 422, details);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(KernelError);
    expect(error.code).toBe(KernelErrorCode.INVALID_INPUT);
    expect(error.message).toBe('invalid');
    expect(error.statusCode).toBe(422);
    expect(error.details).toBe(details);
  });

  it('maps application error variants to stable transport hints and codes', () => {
    const application = new ApplicationError('application', 418, 'APPLICATION_TEST', { retry: false });
    expect(application).toBeInstanceOf(KernelError);
    expect(application.errorCode).toBe('APPLICATION_TEST');
    expect(application.code).toBe('APPLICATION_TEST');
    expect(application.statusCode).toBe(418);
    expect(application.details).toEqual({ retry: false });

    const variants = [
      [new ValidationError(), 400, 'VALIDATION_ERROR', 'Validation Error'],
      [new BadRequestError(), 400, 'BAD_REQUEST', 'Bad Request'],
      [new UnauthorizedError(), 401, KernelErrorCode.UNAUTHORIZED, 'Unauthorized'],
      [new ForbiddenError(), 403, KernelErrorCode.FORBIDDEN, 'Forbidden'],
      [new NotFoundError(), 404, KernelErrorCode.NOT_FOUND, 'Not Found'],
      [new ConflictError(), 409, KernelErrorCode.CONFLICT, 'Conflict'],
      [new InternalServerError(), 500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error'],
    ] as const;

    for (const [error, statusCode, code, message] of variants) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(statusCode);
      expect(error.errorCode).toBe(code);
      expect(error.code).toBe(code);
      expect(error.message).toBe(message);
    }

    expect(new ValidationError('custom validation').message).toBe('custom validation');
    expect(new BadRequestError('custom request').message).toBe('custom request');
    expect(new UnauthorizedError('custom unauthorized').message).toBe('custom unauthorized');
    expect(new ForbiddenError('custom forbidden').message).toBe('custom forbidden');
    expect(new NotFoundError('custom missing').message).toBe('custom missing');
    expect(new ConflictError('custom conflict').message).toBe('custom conflict');
    expect(new InternalServerError('custom internal').message).toBe('custom internal');
  });
});
