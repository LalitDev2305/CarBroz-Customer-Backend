/**
 * Stable error codes for universal kernel/application failure categories.
 *
 * @remarks
 * Domain-specific error codes remain owned by their bounded contexts. These
 * codes exist only for cross-cutting failure categories that transport layers
 * may safely map without knowing business internals.
 */
export enum KernelErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Universal typed error primitive owned by Foundation.
 *
 * @remarks
 * Foundation owns the error shape, not HTTP transport behavior. `statusCode`
 * is retained as a stable application-to-transport hint during Backend V3
 * migration; Fastify-specific mapping remains in `apps/api`.
 */
export class KernelError extends Error {
  constructor(
    public readonly code: KernelErrorCode | string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

/**
 * Backward-compatible application error base for failures that may cross an
 * application/transport boundary.
 *
 * @remarks
 * `errorCode` preserves the legacy API contract while `code` is the canonical
 * Foundation property inherited from `KernelError`. Keeping one constructor
 * identity allows transitional `@carbroz/common` re-exports to remain safe
 * while consumers migrate directly to Foundation.
 */
export class ApplicationError extends KernelError {
  public readonly errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string, details?: unknown) {
    super(errorCode, message, statusCode, details);
    this.errorCode = errorCode;
  }
}

/** Invalid request or application input that reached an application boundary. */
export class ValidationError extends ApplicationError {
  constructor(message: string = 'Validation Error') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/** Generic malformed request/application command. */
export class BadRequestError extends ApplicationError {
  constructor(message: string = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

/** Missing or invalid authentication. */
export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, KernelErrorCode.UNAUTHORIZED);
  }
}

/** Authenticated actor is not permitted to perform an operation. */
export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, KernelErrorCode.FORBIDDEN);
  }
}

/** Requested application resource could not be found. */
export class NotFoundError extends ApplicationError {
  constructor(message: string = 'Not Found') {
    super(message, 404, KernelErrorCode.NOT_FOUND);
  }
}

/** Operation conflicts with current state or an existing resource. */
export class ConflictError extends ApplicationError {
  constructor(message: string = 'Conflict') {
    super(message, 409, KernelErrorCode.CONFLICT);
  }
}

/** Safe generic internal application failure. */
export class InternalServerError extends ApplicationError {
  constructor(message: string = 'Internal Server Error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

/**
 * Transitional name retained for existing API consumers.
 *
 * @deprecated Import `ApplicationError` from `@carbroz/foundation-kernel` in
 * new code. The alias intentionally references the same constructor so
 * `instanceof` behavior is preserved during migration.
 */
export { ApplicationError as AppError };
