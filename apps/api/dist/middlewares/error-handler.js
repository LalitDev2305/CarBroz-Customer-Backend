import { AppError } from '@carbroz/foundation-kernel';
import { ResponseHelper } from '@carbroz/foundation-kernel';
import { ZodError } from 'zod';
export const globalErrorHandler = (error, request, reply) => {
    const traceId = request.traceId;
    if (error instanceof AppError) {
        request.log.warn({ err: error, traceId }, 'Application Error');
        return reply.status(error.statusCode).send(ResponseHelper.error(error.message, error.errorCode, traceId));
    }
    if (error instanceof ZodError) {
        request.log.warn({ err: error, traceId }, 'Validation Error');
        return reply.status(400).send(ResponseHelper.error('Invalid request data', 'VALIDATION_ERROR', traceId));
    }
    // Handle Fastify validation errors
    if (error.validation) {
        request.log.warn({ err: error, traceId }, 'Schema Validation Error');
        return reply.status(400).send(ResponseHelper.error(error.message, 'VALIDATION_ERROR', traceId));
    }
    // Unhandled / Internal errors
    request.log.error({ err: error, traceId }, 'Unhandled Internal Server Error');
    const isProd = process.env.NODE_ENV === 'production';
    const message = isProd ? 'Internal Server Error' : error.message;
    return reply.status(500).send(ResponseHelper.error(message, 'INTERNAL_SERVER_ERROR', traceId));
};
//# sourceMappingURL=error-handler.js.map