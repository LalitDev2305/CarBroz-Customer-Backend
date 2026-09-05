import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

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

  const operationsImports = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]@carbroz\/domain-operations['"];?/g)];
  const hasTrackingSessionImport = operationsImports.some((match) =>
    match[1].split(',').map((name) => name.trim()).some((name) => name === 'TrackingSession' || name.endsWith(' as TrackingSession')),
  );
  if (!hasTrackingSessionImport) {
    source = "import { TrackingSession } from '@carbroz/domain-operations';\n" + source;
  }

  const duplicateTrackingSessionImports = [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]@carbroz\/domain-operations['"];?/g)]
    .reduce((count, match) => count + match[1].split(',').map((name) => name.trim()).filter((name) => name === 'TrackingSession' || name.endsWith(' as TrackingSession')).length, 0);
  if (duplicateTrackingSessionImports !== 1) {
    throw new Error(`Tracking behavioral fixture must import canonical TrackingSession exactly once; found ${duplicateTrackingSessionImports}`);
  }

  const updateUseCaseMarker = '    const updateUseCase = new UpdateLiveGpsLocationUseCase(mockTrackingRepo';
  if (!source.includes(updateUseCaseMarker)) {
    throw new Error('Unable to locate canonical tracking update use-case fixture marker');
  }
  const sessionFixture = `    const session = await mockTrackingRepo.create(new TrackingSession({\n      id: 9001,\n      publicId: 'tracking_fixture_update',\n      bookingId: 1,\n      partnerId: 20,\n      customerId: 10,\n      currentLatitude: 12.9716,\n      currentLongitude: 77.5946,\n      etaMinutes: 30,\n    }));\n\n`;
  if (!source.includes("publicId: 'tracking_fixture_update'")) {
    source = source.replace(updateUseCaseMarker, `${sessionFixture}${updateUseCaseMarker}`);
  }

  if (source.includes('UpdateLocationPingUseCase')) throw new Error('Legacy UpdateLocationPingUseCase test authority survived');
  const updateBlock = source.match(/const\s+session\s*=\s*await\s+mockTrackingRepo\.create[\s\S]*?new\s+UpdateLiveGpsLocationUseCase\([\s\S]*?await\s+updateUseCase\.execute\(\{[\s\S]*?\}\);/);
  if (!updateBlock) throw new Error('Unable to locate seeded canonical tracking update behavioral fixture after migration');
  if (!/sessionId:\s*session\.id/.test(updateBlock[0])) throw new Error('Tracking update fixture does not target the canonical tracking session id');
  if (/bookingPublicId|partnerUserId/.test(updateBlock[0])) throw new Error('Tracking update fixture retains legacy public/user identifiers');
  write(file, source);
}

function walkProduction(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'generated', 'coverage', '.git'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walkProduction(absolute) : [absolute];
  });
}

function hasModifier(node, kind) {
  return node.modifiers?.some((modifier) => modifier.kind === kind) ?? false;
}

function isNonExecutableStatement(statement) {
  if (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement) || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEmptyStatement(statement)) return true;
  if (ts.isImportEqualsDeclaration(statement)) return statement.isTypeOnly === true;
  if (ts.isModuleDeclaration(statement)) return hasModifier(statement, ts.SyntaxKind.DeclareKeyword) || (statement.flags & ts.NodeFlags.Ambient) !== 0;
  if (ts.isVariableStatement(statement) || ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
    return hasModifier(statement, ts.SyntaxKind.DeclareKeyword);
  }
  return false;
}

function isConstitutionNonExecutable(file) {
  if (file.endsWith('.d.ts')) return true;
  const source = read(file);
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  return parsed.statements.every(isNonExecutableStatement);
}

function normalizeCoverageScope() {
  const configFile = p('vitest.config.ts');
  if (!exists(configFile)) throw new Error('vitest.config.ts is required for architecture freeze coverage');

  const productionFiles = ['apps', 'domains', 'sdui', 'platform', 'foundation']
    .flatMap((directory) => walkProduction(p(directory)))
    .filter((file) => file.endsWith('.ts') && !/\.(?:test|spec)\.ts$/.test(file));
  const nonExecutable = productionFiles
    .filter(isConstitutionNonExecutable)
    .map((file) => path.relative(root, file).split(path.sep).join('/'))
    .sort();

  let config = read(configFile);
  config = config.replace(/\n\s*\/\/ constitution-non-executable-start[\s\S]*?\/\/ constitution-non-executable-end\n/g, '\n');
  const marker = '    coverage: {\n';
  if (!config.includes(marker)) throw new Error('Vitest coverage configuration marker is missing');
  const exclusionLines = [
    '      // constitution-non-executable-start',
    '      // Generated/type-only/barrel files are build/architecture evidence, not executable coverage targets.',
    '      exclude: [',
    "        '**/node_modules/**',",
    "        '**/dist/**',",
    "        '**/generated/**',",
    "        '**/*.d.ts',",
    ...nonExecutable.map((file) => `        '${file}',`),
    '      ],',
    '      // constitution-non-executable-end',
  ].join('\n') + '\n';
  config = config.replace(marker, marker + exclusionLines);
  write(configFile, config);

  const executableCount = productionFiles.length - nonExecutable.length;
  if (executableCount <= 0) throw new Error('Coverage classification produced no executable production files');
  console.log(`[architecture-closeout-runtime-regression] coverage scope classified ${nonExecutable.length} non-executable and ${executableCount} executable production TypeScript files`);
}

normalizeRuntimeLoggerConsumer();
normalizeObservabilityAdapters();
normalizeAuditBehavioralFixture();
normalizeTrackingBehavioralFixture();
normalizeCoverageScope();
console.log('[architecture-closeout-runtime-regression] runtime logging, Audit fixture, canonical Tracking behavior and constitution coverage scope converged');
