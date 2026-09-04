import { ILoggerProvider } from '@carbroz/common';
import { createLogger } from '@carbroz/platform-observability';

const logger = createLogger('carbroz-api');

/**
 * Adapts the platform logger to the stable logging provider contract used by application code.
 *
 * The adapter owns no business semantics. Structured context is passed through to the
 * observability implementation, whose redaction policy protects sensitive values. The logger is
 * explicitly named so emitted records remain attributable to the API composition boundary.
 */
export class LoggerProvider implements ILoggerProvider {
  info(message: string, context?: Record<string, unknown>): void {
    logger.info(context || {}, message);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    logger.error({ ...context, err: error }, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    logger.warn(context || {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    logger.debug(context || {}, message);
  }
}
