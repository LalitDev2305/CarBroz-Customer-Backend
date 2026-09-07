import pino, { type LoggerOptions } from 'pino';

export * from './ports/ILoggerProvider.js';

const REDACTED = '[REDACTED]';
const CIRCULAR = '[Circular]';
const INTERNAL = '[Internal]';

/**
 * Sensitive metadata keys are normalized before matching so camelCase, snake_case and kebab-case
 * variants resolve to the same privacy policy. Values under these keys never reach log output.
 */
const SENSITIVE_KEY_NAMES = new Set([
  'authorization', 'proxyauthorization', 'cookie', 'setcookie',
  'password', 'passcode', 'token', 'accesstoken', 'refreshtoken', 'idtoken',
  'otp', 'mockotp',
  'phonenumber', 'phone', 'mobile', 'mobiles', 'email', 'recipient', 'toemail', 'fcmtoken',
  'address', 'formattedaddress', 'streetaddress', 'postaladdress',
  'latitude', 'longitude', 'coordinates', 'location',
  'cardnumber', 'cvv', 'cvc', 'upiid', 'paymentdetails', 'paymentmethoddetails',
  'kyc', 'document', 'documentnumber', 'bankaccount', 'ifsc',
  'secret', 'apikey', 'authkey', 'accesskey', 'secretkey', 'keysecret', 'clientsecret',
  'webhooksecret', 'credential', 'credentials',
  'body', 'payload', 'rawbody', 'requestbody', 'responsebody',
]);

/**
 * Framework/DI internals must never be traversed by the logging sanitizer. Some of these values are
 * lazy proxies (for example Awilix request scopes/cradles), and enumerating them can resolve arbitrary
 * application registrations as a side effect. They are implementation details and provide no useful
 * production log context, so replace them before recursion reaches the underlying runtime object.
 */
const NON_LOGGABLE_RUNTIME_KEY_NAMES = new Set([
  'discope',
  'dicontainer',
  'cradle',
  'registrations',
]);

export const SENSITIVE_PATHS = [
  'req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie',
  'headers.authorization', 'headers.cookie', 'authorization', 'cookie',
  'password', '*.password', 'token', '*.token', 'accessToken', '*.accessToken',
  'refreshToken', '*.refreshToken', 'otp', '*.otp', 'mockOtp', '*.mockOtp',
  'phoneNumber', '*.phoneNumber', 'email', '*.email', 'recipient', '*.recipient',
  'fcmToken', '*.fcmToken',
  'address', '*.address', 'formattedAddress', '*.formattedAddress',
  'latitude', '*.latitude', 'longitude', '*.longitude', 'coordinates', '*.coordinates',
  'cardNumber', '*.cardNumber', 'cvv', '*.cvv', 'upiId', '*.upiId',
  'kyc', '*.kyc', 'document', '*.document', 'documentNumber', '*.documentNumber',
  'bankAccount', '*.bankAccount', 'ifsc', '*.ifsc',
  'secret', '*.secret', 'apiKey', '*.apiKey', 'authKey', '*.authKey',
  'accessKey', '*.accessKey', 'secretKey', '*.secretKey', 'keySecret', '*.keySecret',
  'clientSecret', '*.clientSecret', 'credentials', '*.credentials',
  'body', '*.body', 'payload', '*.payload', 'rawBody', '*.rawBody',
] as const;

function normalizedKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function redactSensitiveMetadataInternal(value: unknown, ancestors: WeakSet<object>): unknown {
  if (value instanceof Error) {
    return { name: value.name };
  }

  if (Array.isArray(value)) {
    if (ancestors.has(value)) return CIRCULAR;
    ancestors.add(value);
    try {
      return value.map((entry) => redactSensitiveMetadataInternal(entry, ancestors));
    } finally {
      ancestors.delete(value);
    }
  }

  if (!isRecord(value)) return value;
  if (ancestors.has(value)) return CIRCULAR;

  ancestors.add(value);
  try {
    const sanitized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const normalized = normalizedKey(key);
      sanitized[key] = SENSITIVE_KEY_NAMES.has(normalized)
        ? REDACTED
        : NON_LOGGABLE_RUNTIME_KEY_NAMES.has(normalized)
          ? INTERNAL
          : redactSensitiveMetadataInternal(nestedValue, ancestors);
    }
    return sanitized;
  } finally {
    ancestors.delete(value);
  }
}

/**
 * Recursively strips sensitive values before they reach Pino. This complements Pino path redaction,
 * protects nested metadata whose depth is not known when the logger is configured, and safely
 * replaces circular references instead of recursively traversing them forever.
 */
export function redactSensitiveMetadata(value: unknown): unknown {
  return redactSensitiveMetadataInternal(value, new WeakSet<object>());
}

function sanitizeLogObject(object: Record<string, unknown>): Record<string, unknown> {
  return redactSensitiveMetadata(object) as Record<string, unknown>;
}

function loggerOptions(level: string): LoggerOptions {
  return {
    level,
    formatters: { log: sanitizeLogObject },
    redact: { paths: [...SENSITIVE_PATHS], censor: REDACTED },
  };
}

/** Creates the process logger with mandatory privacy redaction. */
export function createLogger(level = process.env.LOG_LEVEL ?? 'info') {
  return pino(loggerOptions(level));
}

/** Returns Fastify logger options using the same mandatory redaction policy. */
export function getFastifyLoggerConfig(level = process.env.LOG_LEVEL ?? 'info'): LoggerOptions {
  return loggerOptions(level);
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
