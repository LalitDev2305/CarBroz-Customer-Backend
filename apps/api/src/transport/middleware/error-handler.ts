import { AppError, DomainError } from '@carbroz/foundation-kernel';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { isDetailedDiagnosticLoggingEnabled } from '../../bootstrap/config/diagnostic-mode.js';
import { ResponseHelper } from '../response/ResponseHelper.js';

type DomainErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
};

const DOMAIN_ERROR_PREFIX = /^([A-Z][A-Z0-9_]+):\s*(.*)$/s;

function statusForDomainCode(code: string): number {
  if (code === 'UNAUTHORIZED' || code.endsWith('_UNAUTHORIZED')) return 401;
  if (code === 'FORBIDDEN' || code.endsWith('_FORBIDDEN')) return 403;
  if (code === 'NOT_FOUND' || code.endsWith('_NOT_FOUND')) return 404;
  if (code === 'CONFLICT' || code.endsWith('_CONFLICT')) return 409;
  return 400;
}

function mapDomainError(error: DomainError): DomainErrorResponse {
  let code = error.code?.trim() || 'DOMAIN_ERROR';
  let message = error.message?.trim() || 'Request could not be processed';

  if (code === 'DOMAIN_ERROR') {
    const prefixed = DOMAIN_ERROR_PREFIX.exec(message);
    if (prefixed) {
      code = prefixed[1];
      message = prefixed[2]?.trim() || 'Request could not be processed';
    }
  }

  return {
    statusCode: statusForDomainCode(code),
    code,
    message,
  };
}

/**
 * Canonical API error boundary.
 *
 * Expected application/domain failures retain stable client-safe semantics.
 * Transport validation details and unhandled exception messages are logged
 * server-side only and never reflected to clients. Development/Staging uses the
 * single formatted API error block from request-flow.plugin instead of duplicating
 * a second Pino error line here.
 */
export const globalErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const traceId = request.traceId;
  const structuredErrorLogging = !isDetailedDiagnosticLoggingEnabled();

  if (error instanceof AppError) {
    const isServerError = error.statusCode >= 500;
    if (structuredErrorLogging) {
      if (isServerError) {
        request.log.error({ err: error, traceId }, 'Application Server Error');
      } else {
        request.log.warn({ err: error, traceId }, 'Application Error');
      }
    }

    return reply.status(error.statusCode).send(
      ResponseHelper.error(
        isServerError ? 'Internal Server Error' : error.message,
        error.errorCode,
        traceId,
      ),
    );
  }

  if (error instanceof DomainError) {
    const mapped = mapDomainError(error);
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Domain Error');
    return reply.status(mapped.statusCode).send(
      ResponseHelper.error(mapped.message, mapped.code, traceId),
    );
  }

  if (error instanceof ZodError) {
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Validation Error');
    return reply.status(400).send(
      ResponseHelper.error('Invalid request data', 'VALIDATION_ERROR', traceId),
    );
  }

  if (error.validation) {
    if (structuredErrorLogging) request.log.warn({ err: error, traceId }, 'Schema Validation Error');
    return reply.status(400).send(
      ResponseHelper.error('Invalid request data', 'VALIDATION_ERROR', traceId),
    );
  }

  if (structuredErrorLogging) request.log.error({ err: error, traceId }, 'Unhandled Internal Server Error');
  return reply.status(500).send(
    ResponseHelper.error('Internal Server Error', 'INTERNAL_SERVER_ERROR', traceId),
  );
};
