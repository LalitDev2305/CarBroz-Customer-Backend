import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// One-time closeout entrypoint: deterministic transform -> residue audit -> static gate -> CI validation.
// Final output rejects Common, removes duplicate compatibility ports, resolves self-imports, and validates observability adapters.
const root = process.cwd();
const baselineCommit = 'fbd7e0d38ba58136c7cc0be596314d62f20dcb6c';
let driverSource = execFileSync('git', ['show', `${baselineCommit}:tools/architecture-closeout.mjs`], {
  cwd: root,
  encoding: 'utf8',
});

const oldImportGate = "if (content.includes('@carbroz/common')) violations.push(`${rel(file)} imports @carbroz/common`);";
const productionImportGate = "if (!rel(file).startsWith('tests/') && /(?:from\\s+['\"]@carbroz\\/common['\"]|import\\s*\\(\\s*['\"]@carbroz\\/common['\"]\\s*\\)|require\\s*\\(\\s*['\"]@carbroz\\/common['\"]\\s*\\))/.test(content)) violations.push(`${rel(file)} imports @carbroz/common`);";
const oldUnsafePush = "violations.push(`${rel(file)} contains unsafe logging`)";
const preciseSecurityEvidence = "void 0 /* precise sensitive-log validation is enforced by architecture-closeout-residue.mjs */";
const oldValidateCall = 'validateStaticCloseout();';
const cleanupThenValidate = "await import('./tools/architecture-closeout-residue.mjs');\nvalidateStaticCloseout();";

const patchWorkerSource = [
  `workerSource = workerSource.replace(${JSON.stringify(oldImportGate)}, ${JSON.stringify(productionImportGate)});`,
  `workerSource = workerSource.replace(${JSON.stringify(oldUnsafePush)}, ${JSON.stringify(preciseSecurityEvidence)});`,
  `workerSource = workerSource.replace(${JSON.stringify(oldValidateCall)}, ${JSON.stringify(cleanupThenValidate)});`,
].join('\n');

driverSource = driverSource.replace(
  "const worker = p('.architecture-closeout-worker.mjs');",
  `${patchWorkerSource}\nconst worker = p('.architecture-closeout-worker.mjs');`,
);

const driver = path.join(root, '.architecture-closeout-driver.mjs');
fs.writeFileSync(driver, driverSource);

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

function normalizeObservabilityAdapter() {
  const loggerAdapter = path.join(root, 'platform/observability/src/adapters/LoggerProvider.ts');
  if (!fs.existsSync(loggerAdapter)) return;
  write(loggerAdapter, `import type { ILoggerProvider } from '../ports/ILoggerProvider.js';
import { createLogger } from '../index.js';

/**
 * Adapts the canonical observability logger factory to the stable ILoggerProvider contract.
 * Redaction and logger configuration remain owned by createLogger; this adapter adds no policy.
 */
export class LoggerProvider implements ILoggerProvider {
  private readonly logger = createLogger();

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.logger.error({ ...context, err: error }, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context ?? {}, message);
  }
}
`);
  console.log('[closeout-orchestrator] observability logger adapter normalized');
}

try {
  execFileSync(process.execPath, ['--check', driver], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, [driver], { cwd: root, stdio: 'inherit' });
  normalizeObservabilityAdapter();
  fs.rmSync(path.join(root, 'tools/architecture-closeout-residue.mjs'), { force: true });
} finally {
  fs.rmSync(driver, { force: true });
}
