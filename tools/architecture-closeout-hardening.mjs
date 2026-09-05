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

function walk(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'generated', '.git', 'coverage'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function normalizeDomainPublicBoundaries() {
  const publicEntries = walk(p('domains')).filter((file) => file.endsWith(`${path.sep}public${path.sep}index.ts`));
  for (const file of publicEntries) {
    const source = read(file);
    const cleaned = source
      .split(/\r?\n/)
      .filter((line) => !line.includes('/infrastructure/') && !line.includes('@prisma/client'))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    write(file, cleaned);
  }

  const residue = publicEntries.filter((file) => {
    const source = read(file);
    return source.includes('/infrastructure/') || source.includes('@prisma/client');
  });
  if (residue.length) {
    throw new Error(`Concrete infrastructure still leaks through domain public boundaries:\n${residue.map((file) => path.relative(root, file)).join('\n')}`);
  }
  console.log(`[architecture-closeout-hardening] cleaned ${publicEntries.length} domain public boundaries`);
}

function normalizeRuntimeConfigObservability() {
  const file = p('apps/api/src/bootstrap/config/runtime-config.ts');
  if (!exists(file)) return;
  let source = read(file);
  if (!/\bconsole\.(?:log|debug|info|warn|error)\s*\(/.test(source)) return;

  if (!source.includes("from '@carbroz/platform-observability'")) {
    source = `import { createLogger } from '@carbroz/platform-observability';\n${source}`;
  } else if (!source.includes('createLogger')) {
    source = source.replace(
      /import\s+\{([^}]*)\}\s+from\s+['"]@carbroz\/platform-observability['"];?/,
      (_full, names) => `import { ${[...names.split(',').map((name) => name.trim()).filter(Boolean), 'createLogger'].join(', ')} } from '@carbroz/platform-observability';`,
    );
  }

  const importEnd = [...source.matchAll(/^import[^\n]*;\s*$/gm)].at(-1);
  const loggerDeclaration = "\nconst runtimeConfigLogger = createLogger('carbroz-api-runtime-config');\n";
  if (!source.includes('const runtimeConfigLogger')) {
    if (importEnd) {
      const index = importEnd.index + importEnd[0].length;
      source = source.slice(0, index) + loggerDeclaration + source.slice(index);
    } else {
      source = loggerDeclaration.trimStart() + source;
    }
  }

  source = source
    .replace(/\bconsole\.log\s*\(/g, 'runtimeConfigLogger.info(')
    .replace(/\bconsole\.info\s*\(/g, 'runtimeConfigLogger.info(')
    .replace(/\bconsole\.debug\s*\(/g, 'runtimeConfigLogger.debug(')
    .replace(/\bconsole\.warn\s*\(/g, 'runtimeConfigLogger.warn(')
    .replace(/\bconsole\.error\s*\(/g, 'runtimeConfigLogger.error(');
  write(file, source);
  console.log('[architecture-closeout-hardening] runtime configuration logging routed through Observability');
}

function normalizeAuditFailureObservability() {
  const service = p('domains/audit/application/AuditLogService.ts');
  if (!exists(service)) return;

  write(p('domains/audit/application/ports/IAuditFailureObserver.ts'), `/**
 * Semantic application port for reporting a failed audit persistence attempt.
 * Audit owns the failure meaning; the concrete technical logging adapter belongs to Observability.
 */
export interface IAuditFailureObserver {
  report(error: unknown, context: Readonly<{ operation: 'audit-log-create' }>): void;
}
`);

  write(service, `import { AuditLog, type AuditLogProps } from '../domain/AuditLog.js';
import type { IAuditLogRepository } from '../domain/repositories/IAuditLogRepository.js';
import type { IAuditFailureObserver } from './ports/IAuditFailureObserver.js';

/**
 * Persists immutable audit records without allowing an audit-store outage to interrupt the
 * originating business flow. Failures are still observable through the injected semantic port.
 */
export class AuditLogService {
  constructor(
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly auditFailureObserver: IAuditFailureObserver,
  ) {}

  async log(props: AuditLogProps): Promise<AuditLog | null> {
    try {
      const auditLog = new AuditLog(props);
      return await this.auditLogRepository.create(auditLog);
    } catch (error) {
      this.auditFailureObserver.report(error, { operation: 'audit-log-create' });
      return null;
    }
  }
}
`);

  const observer = p('platform/observability/src/adapters/AuditFailureObserver.ts');
  write(observer, `import { createLogger } from '../index.js';

/** Observability adapter for the Audit bounded context's non-blocking persistence failure port. */
export class AuditFailureObserver {
  private readonly logger = createLogger('carbroz-audit');

  report(error: unknown, context: Readonly<{ operation: 'audit-log-create' }>): void {
    this.logger.error({ err: error, operation: context.operation }, 'audit.persistence.failed');
  }
}
`);

  const observabilityIndex = p('platform/observability/src/index.ts');
  if (!exists(observabilityIndex)) throw new Error('Canonical Observability public entry point is missing');
  let observabilitySource = read(observabilityIndex);
  const observerExport = "export * from './adapters/AuditFailureObserver.js';";
  if (!observabilitySource.includes(observerExport)) observabilitySource += `\n${observerExport}\n`;
  write(observabilityIndex, observabilitySource);

  const loggerProvider = p('platform/observability/src/adapters/LoggerProvider.ts');
  if (exists(loggerProvider)) {
    write(loggerProvider, read(loggerProvider).replace(/createLogger\(\)/g, "createLogger('carbroz-observability')"));
  }

  const apiContainer = p('apps/api/src/bootstrap/container/index.ts');
  if (!exists(apiContainer)) throw new Error('Canonical API bootstrap container is missing for Audit observer composition');
  let containerSource = read(apiContainer);
  const observerImport = "import { AuditFailureObserver } from '@carbroz/platform-observability';";
  if (!containerSource.includes('AuditFailureObserver')) containerSource = `${observerImport}\n${containerSource}`;
  if (!containerSource.includes('auditFailureObserver:')) {
    const marker = 'diContainer.register({';
    const markerIndex = containerSource.indexOf(marker);
    if (markerIndex < 0) throw new Error('Unable to locate canonical diContainer registration for Audit failure observer');
    const insertAt = markerIndex + marker.length;
    containerSource = `${containerSource.slice(0, insertAt)}\n      auditFailureObserver: asClass(AuditFailureObserver).classic().singleton(),${containerSource.slice(insertAt)}`;
  }
  if (!containerSource.includes('registerAuditModule(diContainer)')) {
    throw new Error('Audit module is not composed through the canonical API container');
  }
  const registrationIndex = containerSource.indexOf('auditFailureObserver:');
  const auditModuleIndex = containerSource.indexOf('registerAuditModule(diContainer)');
  if (registrationIndex < 0 || auditModuleIndex < 0 || registrationIndex > auditModuleIndex) {
    throw new Error('Audit failure observer must be registered before the Audit module is composed');
  }
  write(apiContainer, containerSource);
  console.log('[architecture-closeout-hardening] Audit failures remain non-blocking and are reported through canonical Observability');
}

function verifyNoProductionConsoleLogging() {
  const violations = ['apps', 'domains', 'sdui', 'platform', 'foundation']
    .flatMap((base) => walk(p(base)))
    .filter((file) => /\.(?:ts|mts|cts)$/.test(file))
    .filter((file) => /\bconsole\.(?:log|debug|info|warn|error)\s*\(/.test(read(file)));
  if (violations.length) {
    throw new Error(`Direct console logging remains after Observability hardening:\n${violations.map((file) => path.relative(root, file)).join('\n')}`);
  }
}

normalizeDomainPublicBoundaries();
normalizeRuntimeConfigObservability();
normalizeAuditFailureObservability();
verifyNoProductionConsoleLogging();
console.log('[architecture-closeout-hardening] final public-boundary and observability hardening passed');
