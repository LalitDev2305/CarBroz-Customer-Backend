import { ILoggerProvider } from '@carbroz/foundation-kernel';
export declare class LoggerProvider implements ILoggerProvider {
    info(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    debug(message: string, context?: Record<string, unknown>): void;
}
