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

export interface HttpRequestDiagnostic {
  correlationId: string;
  method: string;
  url: string;
  headers: unknown;
  body?: unknown;
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

/** Development/Staging-only readable request block. Production callers must pass enabled=false. */
export function emitHttpRequestDiagnostic(enabled: boolean, input: HttpRequestDiagnostic): void {
  if (!enabled) return;
  emitDiagnosticBlock(
    ANSI.cyan,
    `🌐 API REQUEST  ${input.method} ${sanitizeDiagnosticUrl(input.url)}`,
    [
      `TRACE    ${input.correlationId}`,
      `METHOD   ${input.method}`,
      `URL      ${sanitizeDiagnosticUrl(input.url)}`,
      'HEADERS',
      indent(formatDiagnosticValue(input.headers)),
      'BODY',
      indent(input.body === undefined ? '<none>' : formatDiagnosticValue(input.body)),
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
  const queryIndex = url.indexOf('?');
  if (queryIndex < 0) return url;
  const base = url.slice(0, queryIndex);
  const query = url.slice(queryIndex + 1);
  const sanitized = query.split('&').map((entry) => {
    const delimiter = entry.indexOf('=');
    if (delimiter < 0) return entry;
    const key = entry.slice(0, delimiter);
    const value = entry.slice(delimiter + 1);
    return `${key}=${SENSITIVE_KEY_NAMES.has(normalizedKey(key)) ? REDACTED : value}`;
  }).join('&');
  return `${base}?${sanitized}`;
}

function indent(value: string): string {
  return value.split('\n').map((line) => `  ${line}`).join('\n');
}

function emitDiagnosticBlock(color: string, title: string, lines: string[], stderr = false): void {
  const rendered = [
    `${color}╭─ ${title}`,
    ...lines.flatMap((line) => line.split('\n')).map((line) => `│ ${line}`),
    `╰────────────────────────────────────────────────────────${ANSI.reset}`,
  ].join('\n') + '\n';
  if (stderr) process.stderr.write(rendered); else process.stdout.write(rendered);
}

const ANSI = {
  reset: '\u001B[0m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  magenta: '\u001B[35m',
  cyan: '\u001B[36m',
} as const;

export * from './adapters/LoggerProvider.js';
