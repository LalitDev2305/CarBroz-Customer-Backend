
/** ILoggerProvider is an exported platform/observability contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ILoggerProvider {
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}
