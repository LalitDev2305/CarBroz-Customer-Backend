import { ILoggerProvider } from '@carbroz/common';
import { logger } from '@carbroz/logger';

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
