/**
 * Transitional compatibility exports for universal application errors.
 *
 * @deprecated `packages/common` is scheduled for deletion by the Backend V3
 * Master Constitution. New code must import these primitives directly from
 * `@carbroz/foundation-kernel`. Re-exporting the exact Foundation constructors
 * preserves `instanceof` behavior while legacy consumers migrate.
 */
export {
  ApplicationError as AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@carbroz/foundation-kernel';
