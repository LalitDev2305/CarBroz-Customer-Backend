import { AppError, DomainError } from '@carbroz/foundation-kernel';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { isDetailedDiagnosticLoggingEnabled } from '../../bootstrap/config/diagnostic-mode.js';
import { ResponseHelper, type ApiErrorStatus } from '../response/ResponseHelper.js';

type DomainErrorResponse = {
  statusCode: ApiErrorStatus;
  message: string;
};

const DOMAIN_ERROR_PREFIX = /^([A-Z][A-Z0-9_]+):\s*(.*)$/s;

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
      return statusCode;
    default:
      return statusCode >= 500 ? 500 : 400;
  }
}

/**
 * Canonical API error boundary.
 *
 * Expected application/domain failures retain client-safe messages while the response code is
 * derived centrally from the HTTP status. Transport validation details and unhandled exception
 * messages are logged server-side only and never reflected to clients.
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
        isServerError ? 'Something went wrong. Please try again later.' : error.message,
        traceId,
      ),
    );
  }

  if (error instanceof DomainError) {
    const mapped = mapDomainError(error);
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Domain Error');
    return reply.status(mapped.statusCode).send(
      ResponseHelper.error(mapped.statusCode, mapped.message, traceId),
    );
  }

  if (error instanceof ZodError) {
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Validation Error');
    return reply.status(400).send(
      ResponseHelper.error(400, 'The request contains invalid information.', traceId),
    );
  }

  if (error.validation) {
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Schema Validation Error');
    return reply.status(400).send(
      ResponseHelper.error(400, 'The request contains invalid information.', traceId),
    );
  }

  if (structuredErrorLogging) request.log.error({ err: error, traceId }, 'Unhandled Internal Server Error');
  return reply.status(500).send(
    ResponseHelper.error(500, 'Something went wrong. Please try again later.', traceId),
  );
};
