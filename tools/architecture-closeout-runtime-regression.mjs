import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = fs.existsSync;
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

function normalizeRuntimeLoggerConsumer() {
  const file = p('apps/api/src/bootstrap/config/runtime-config.ts');
  if (!exists(file)) return;
  let source = read(file);
  source = source
    .replace(
      /import\s+\{\s*logger\s+as\s+runtimeConfigLogger\s*\}\s+from\s+['"]@carbroz\/platform-observability['"];?\r?\n?/,
      "import { createLogger } from '@carbroz/platform-observability';\n",
    )
    .replace(
      /import\s+\{\s*createLogger\s*\}\s+from\s+['"]@carbroz\/platform-observability['"];?\r?\n?/,
      "import { createLogger } from '@carbroz/platform-observability';\n",
    )
    .replace(/\r?\nconst runtimeConfigLogger = createLogger\([^\n]*\);\r?\n?/, '\n');
  const importEnd = [...source.matchAll(/^import[^\n]*;\s*$/gm)].at(-1);
  if (!source.includes('const runtimeConfigLogger = createLogger();')) {
    const declaration = "\nconst runtimeConfigLogger = createLogger();\n";
    if (importEnd) {
      const index = importEnd.index + importEnd[0].length;
      source = source.slice(0, index) + declaration + source.slice(index);
    } else {
      source = declaration.trimStart() + source;
    }
  }
  if (!source.includes("import { createLogger } from '@carbroz/platform-observability';")) {
    throw new Error('Runtime configuration no longer consumes the canonical Observability factory');
  }
  if (/createLogger\(\s*['"]carbroz-/.test(source)) {
    throw new Error('Runtime configuration passes a logger name into the canonical level-only createLogger contract');
  }
  write(file, source);
}

function normalizeObservabilityAdapters() {
  const auditObserver = p('platform/observability/src/adapters/AuditFailureObserver.ts');
  if (exists(auditObserver)) {
    write(auditObserver, `import { createLogger } from '../index.js';

/** Observability adapter for the Audit bounded context's non-blocking persistence failure port. */
export class AuditFailureObserver {
  private readonly auditLogger = createLogger();

  report(error: unknown, context: Readonly<{ operation: 'audit-log-create' }>): void {
    this.auditLogger.error({ err: error, operation: context.operation }, 'audit.persistence.failed');
  }
}
`);
  }

  const loggerProvider = p('platform/observability/src/adapters/LoggerProvider.ts');
  if (exists(loggerProvider)) {
    write(loggerProvider, `import type { ILoggerProvider } from '../ports/ILoggerProvider.js';
import { createLogger } from '../index.js';

/**
 * Adapts the canonical observability logger factory to the stable ILoggerProvider contract.
 * Redaction and log-level policy remain owned by the Observability package.
 */
export class LoggerProvider implements ILoggerProvider {
  private readonly providerLogger = createLogger();

  info(message: string, context?: Record<string, unknown>): void {
    this.providerLogger.info(context ?? {}, message);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.providerLogger.error({ ...context, err: error }, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.providerLogger.warn(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.providerLogger.debug(context ?? {}, message);
  }
}
`);
  }
}

function normalizeAuditBehavioralFixture() {
  const file = p('tests/integration/domain/audit.test.ts');
  if (!exists(file)) return;
  let source = read(file);
  let replacements = 0;
  source = source.replace(/new\s+AuditLogService\(\s*([A-Za-z_$][\w$]*)\s*\)/g, (_full, repository) => {
    replacements += 1;
    return `new AuditLogService(${repository}, { report: () => undefined })`;
  });
  if (replacements === 0 && /new\s+AuditLogService\([^,\n]+\)/.test(source)) {
    throw new Error('Audit integration fixture still constructs AuditLogService without the required failure observer');
  }
  if (/new\s+AuditLogService\(\s*[^,()]+\s*\)/.test(source)) {
    throw new Error('Audit integration fixture retained a one-argument AuditLogService construction');
  }
  write(file, source);
}

function normalizeTrackingBehavioralFixture() {
  const file = p('tests/integration/application/tracking-notification-engine.test.ts');
  if (!exists(file)) return;
  let source = read(file);
  if (!source.includes('UpdateLocationPingUseCase')) return;

  source = source.replaceAll('UpdateLocationPingUseCase', 'UpdateLiveGpsLocationUseCase');
  source = source.replace(
    /bookingPublicId:\s*dummyBooking\.publicId!,\s*\r?\n(\s*)partnerUserId:\s*20,/g,
    (_full, indent) => `sessionId: session.id,\n${indent}`,
  );
  source = source.replace(/bookingPublicId:\s*dummyBooking\.publicId!,/g, 'sessionId: session.id,');
  source = source.replace(/^\s*partnerUserId:\s*20,?\s*$/gm, '');

  if (source.includes('UpdateLocationPingUseCase')) throw new Error('Legacy UpdateLocationPingUseCase test authority survived');
  const updateBlock = source.match(/new\s+UpdateLiveGpsLocationUseCase\([\s\S]*?await\s+updateUseCase\.execute\(\{[\s\S]*?\}\);/);
  if (!updateBlock) throw new Error('Unable to locate canonical tracking update behavioral fixture after symbol migration');
  if (!/sessionId:\s*session\.id/.test(updateBlock[0])) throw new Error('Tracking update fixture does not target the canonical tracking session id');
  if (/bookingPublicId|partnerUserId/.test(updateBlock[0])) throw new Error('Tracking update fixture retains legacy public/user identifiers');
  write(file, source);
}

normalizeRuntimeLoggerConsumer();
normalizeObservabilityAdapters();
normalizeAuditBehavioralFixture();
normalizeTrackingBehavioralFixture();
console.log('[architecture-closeout-runtime-regression] runtime logging, Audit fixture and canonical Tracking behavior converged');
