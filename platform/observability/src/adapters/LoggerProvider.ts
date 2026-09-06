import type { ILoggerProvider } from '../ports/ILoggerProvider.js';
import { createLogger } from '../index.js';

/**
 * Adapts the canonical observability logger factory to the stable ILoggerProvider contract.
 * Redaction and logger configuration remain owned by createLogger; this adapter adds no policy.
 */
export class LoggerProvider implements ILoggerProvider {
  private readonly logger = createLogger();

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.logger.error({ ...context, err: error }, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context ?? {}, message);
  }
}
