import { AppError, DomainError } from '@carbroz/foundation-kernel';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { isDetailedDiagnosticLoggingEnabled } from '../../bootstrap/config/diagnostic-mode.js';
import { ResponseHelper, type ApiErrorStatus } from '../response/ResponseHelper.js';

type DomainErrorResponse = {
  statusCode: ApiErrorStatus;
  code: string;
  message: string;
};

const DOMAIN_ERROR_PREFIX = /^([A-Z][A-Z0-9_]+):\s*(.*)$/s;
const SAFE_VALIDATION_MESSAGE = 'The request contains invalid information.';
const SAFE_INTERNAL_MESSAGE = 'Something went wrong. Please try again later.';
const SAFE_UNAUTHORIZED_MESSAGE = 'Authentication is required.';
const SAFE_FORBIDDEN_MESSAGE = 'Access is forbidden.';

function statusForDomainCode(code: string): ApiErrorStatus {
  if (code === 'UNAUTHORIZED' || code.endsWith('_UNAUTHORIZED')) return 401;
  if (code === 'FORBIDDEN' || code.endsWith('_FORBIDDEN')) return 403;
  if (code === 'NOT_FOUND' || code.endsWith('_NOT_FOUND')) return 404;
  if (code === 'CONFLICT' || code.endsWith('_CONFLICT')) return 409;
  return 422;
}

function mapDomainError(error: DomainError): DomainErrorResponse {
  let code = error.code?.trim() || 'DOMAIN_ERROR';
  let message = error.message?.trim() || 'The request could not be processed.';

  if (code === 'DOMAIN_ERROR') {
    const prefixed = DOMAIN_ERROR_PREFIX.exec(message);
    if (prefixed) {
      code = prefixed[1];
      message = prefixed[2]?.trim() || 'The request could not be processed.';
    }
  }

  return {
    statusCode: statusForDomainCode(code),
    code,
    message,
  };
}

function normalizeErrorStatus(statusCode: number): ApiErrorStatus {
  switch (statusCode) {
    case 400:
    case 401:
    case 403:
    case 404:
    case 409:
    case 422:
    case 429:
    case 500:
    case 503:
      return statusCode;
    default:
      return statusCode >= 500 ? 500 : 400;
  }
}

/**
 * Canonical API error boundary.
 *
 * Expected application/domain failures preserve their stable machine-readable code while the
 * transport owns HTTP mapping. Validation and unhandled exception details remain server-side only.
 */
export const globalErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const traceId = request.traceId;
  const structuredErrorLogging = !isDetailedDiagnosticLoggingEnabled();

  if (error instanceof AppError) {
    const status = normalizeErrorStatus(error.statusCode);
    const isServerError = status >= 500;
    const code = error.errorCode?.trim() || error.code?.trim() || undefined;
    if (structuredErrorLogging) {
      if (isServerError) {
        request.log.error({ err: error, traceId }, 'Application Server Error');
      } else {
        request.log.warn({ err: error, traceId }, 'Application Error');
      }
    }

    return reply.status(status).send(
      ResponseHelper.error(
        status,
        isServerError ? SAFE_INTERNAL_MESSAGE : error.message,
        traceId,
        code,
      ),
    );
  }

  if (error instanceof DomainError) {
    const mapped = mapDomainError(error);
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Domain Error');
    return reply.status(mapped.statusCode).send(
      ResponseHelper.error(mapped.statusCode, mapped.message, traceId, mapped.code),
    );
  }

  if (error instanceof ZodError) {
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Validation Error');
    return reply.status(400).send(
      ResponseHelper.error(400, SAFE_VALIDATION_MESSAGE, traceId, 'VALIDATION_ERROR'),
    );
  }

  if (error.validation) {
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Schema Validation Error');
    return reply.status(400).send(
      ResponseHelper.error(400, SAFE_VALIDATION_MESSAGE, traceId, 'VALIDATION_ERROR'),
    );
  }

  // Fastify authentication plugins (including @fastify/jwt) surface transport-owned 401/403
  // errors rather than Foundation AppError instances. Preserve the transport status while keeping
  // plugin/internal error details out of the public envelope.
  if (error.statusCode === 401 || error.statusCode === 403) {
    const status = error.statusCode;
    const code = status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN';
    const message = status === 401 ? SAFE_UNAUTHORIZED_MESSAGE : SAFE_FORBIDDEN_MESSAGE;
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Transport Access Error');
    return reply.status(status).send(ResponseHelper.error(status, message, traceId, code));
  }

  if (structuredErrorLogging) request.log.error({ err: error, traceId }, 'Unhandled Internal Server Error');
  return reply.status(500).send(
    ResponseHelper.error(500, SAFE_INTERNAL_MESSAGE, traceId, 'INTERNAL_SERVER_ERROR'),
  );
};
