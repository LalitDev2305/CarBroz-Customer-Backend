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

/** Recursively strips sensitive values before they reach structured/readable log output. */
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

/** Emits structured request/application flow metadata without accepting arbitrary payloads. */
export function logFlow(logger: { info: (obj: object, msg?: string) => void; error: (obj: object, msg?: string) => void }, event: string, fields: FlowLogFields): void {
  const method = fields.outcome === 'failed' ? logger.error.bind(logger) : logger.info.bind(logger);
  method({ event, ...fields }, event);
}

/** Development/Staging request diagnostics are metadata-only by contract. */
export interface HttpRequestDiagnostic {
  correlationId: string;
  method: string;
  url: string;
}

export interface HttpResponseDiagnostic {
  correlationId: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs?: number;
  body?: unknown;
}

export interface HttpErrorDiagnostic {
  correlationId: string;
  method: string;
  url: string;
  errorCode: string;
  statusCode?: number;
  durationMs?: number;
  body?: unknown;
}

/** Development/Staging-only readable request block. Request headers/bodies are never accepted. */
export function emitHttpRequestDiagnostic(enabled: boolean, input: HttpRequestDiagnostic): void {
  if (!enabled) return;
  emitDiagnosticBlock(
    ANSI.cyan,
    `🌐 API REQUEST  ${input.method} ${sanitizeDiagnosticUrl(input.url)}`,
    [
      `TRACE    ${input.correlationId}`,
      `METHOD   ${input.method}`,
      `URL      ${sanitizeDiagnosticUrl(input.url)}`,
    ],
  );
}

/** Development/Staging-only readable response block. */
export function emitHttpResponseDiagnostic(enabled: boolean, input: HttpResponseDiagnostic): void {
  if (!enabled) return;
  emitDiagnosticBlock(
    ANSI.green,
    `✅ API RESPONSE  ${input.statusCode} ${input.method} ${sanitizeDiagnosticUrl(input.url)}`,
    [
      `TRACE    ${input.correlationId}`,
      `STATUS   ${input.statusCode}`,
      `URL      ${sanitizeDiagnosticUrl(input.url)}`,
      ...(input.durationMs === undefined ? [] : [`TIME     ${input.durationMs.toFixed(1)} ms`]),
      'JSON',
      indent(input.body === undefined ? '<empty>' : formatDiagnosticValue(input.body)),
    ],
  );
}

/** Development/Staging-only readable error block. */
export function emitHttpErrorDiagnostic(enabled: boolean, input: HttpErrorDiagnostic): void {
  if (!enabled) return;
  emitDiagnosticBlock(
    ANSI.red,
    `❌ API ERROR  ${input.statusCode ?? ''} ${input.method} ${sanitizeDiagnosticUrl(input.url)}`.replace(/\s+/g, ' '),
    [
      `TRACE    ${input.correlationId}`,
      ...(input.statusCode === undefined ? [] : [`STATUS   ${input.statusCode}`]),
      `URL      ${sanitizeDiagnosticUrl(input.url)}`,
      `ERROR    ${input.errorCode}`,
      ...(input.durationMs === undefined ? [] : [`TIME     ${input.durationMs.toFixed(1)} ms`]),
      ...(input.body === undefined ? [] : ['JSON', indent(formatDiagnosticValue(input.body))]),
    ],
    true,
  );
}

/** Development/Staging-only human-readable class/function handoff. */
export function emitFlowDiagnostic(enabled: boolean, correlationId: string, from: string, to?: string): void {
  if (!enabled) return;
  const arrow = to ? ` → ${to}` : '';
  process.stdout.write(`${ANSI.magenta}▶️ FLOW  ${from}${arrow}  [${correlationId}]${ANSI.reset}\n`);
}

function formatDiagnosticValue(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '<empty>';
    try {
      return JSON.stringify(redactSensitiveMetadata(JSON.parse(trimmed)), null, 2);
    } catch {
      return '<non-json payload omitted>';
    }
  }
  try {
    return JSON.stringify(redactSensitiveMetadata(value), null, 2) ?? '<empty>';
  } catch {
    return '<unavailable>';
  }
}

function sanitizeDiagnosticUrl(url: string): string {
  const [path, query] = url.split('?', 2);
  if (!query) return path ?? '/';
  const params = new URLSearchParams(query);
  for (const key of [...params.keys()]) {
    if (SENSITIVE_KEY_NAMES.has(normalizedKey(key))) params.set(key, REDACTED);
  }
  const sanitized = params.toString();
  return sanitized ? `${path ?? '/'}?${sanitized}` : path ?? '/';
}

function indent(value: string): string {
  return value.split('\n').map((line) => `  ${line}`).join('\n');
}

const ANSI = {
  reset: '\u001b[0m',
  cyan: '\u001b[36m',
  green: '\u001b[32m',
  red: '\u001b[31m',
  magenta: '\u001b[35m',
} as const;

function emitDiagnosticBlock(color: string, title: string, lines: string[], error = false): void {
  const writer = error ? process.stderr : process.stdout;
  writer.write(`${color}╭─ ${title}${ANSI.reset}\n`);
  for (const line of lines) writer.write(`${color}│${ANSI.reset} ${line}\n`);
  writer.write(`${color}╰────────────────────────────────────────────────────────${ANSI.reset}\n`);
}

export * from './adapters/LoggerProvider.js';
