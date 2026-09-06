import pino, { type LoggerOptions } from 'pino';

export * from './ports/ILoggerProvider.js';
const SENSITIVE_PATHS = [
  'req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie',
  'headers.authorization', 'headers.cookie', 'authorization', 'cookie',
  'password', '*.password', 'token', '*.token', 'accessToken', '*.accessToken',
  'refreshToken', '*.refreshToken', 'otp', '*.otp', 'mockOtp', '*.mockOtp',
  'phoneNumber', '*.phoneNumber', 'email', '*.email', 'fcmToken', '*.fcmToken',
  'cardNumber', '*.cardNumber', 'cvv', '*.cvv', 'upiId', '*.upiId',
  'kyc', '*.kyc', 'document', '*.document', 'documentNumber', '*.documentNumber',
  'bankAccount', '*.bankAccount', 'ifsc', '*.ifsc', 'secret', '*.secret'
] as const;

/** Creates the process logger with mandatory privacy redaction. */
export function createLogger(level = process.env.LOG_LEVEL ?? 'info') {
  return pino({ level, redact: { paths: [...SENSITIVE_PATHS], censor: '[REDACTED]' } });
}

/** Returns Fastify logger options using the same mandatory redaction policy. */
export function getFastifyLoggerConfig(level = process.env.LOG_LEVEL ?? 'info'): LoggerOptions {
  return { level, redact: { paths: [...SENSITIVE_PATHS], censor: '[REDACTED]' } };
}

/** Safe metadata carried by application-flow log events. Payload bodies are intentionally unsupported. */
export interface FlowLogFields {
  correlationId: string;
  surface?: 'partner' | 'customer' | 'admin' | 'system';
  operation?: string;
  useCase?: string;
  method?: string;
  route?: string;
  statusCode?: number;
  durationMs?: number;
  actorKind?: string;
  outcome?: 'started' | 'completed' | 'failed';
  errorCode?: string;
}

/**
 * Emits structured flow events that make request → surface → application → response interaction traceable
 * without ever accepting arbitrary request/response payloads.
 */
export function logFlow(logger: { info: (obj: object, msg?: string) => void; error: (obj: object, msg?: string) => void }, event: string, fields: FlowLogFields): void {
  const method = fields.outcome === 'failed' ? logger.error.bind(logger) : logger.info.bind(logger);
  method({ event, ...fields }, event);
}
export * from './adapters/LoggerProvider.js';
