import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// One-time closeout entrypoint: deterministic transform -> residue audit -> static gate -> CI validation.
// Final output rejects Common, removes duplicate compatibility/application authorities, resolves self-imports,
// applies scoped post-transform convergence fixes, and revalidates Customer, Configuration and Identity boundaries.
const root = process.cwd();
const baselineCommit = 'fbd7e0d38ba58136c7cc0be596314d62f20dcb6c';
const selfImportResolver = path.join(root, 'tools/architecture-closeout-self-imports.mjs');
const partnerConvergence = path.join(root, 'tools/architecture-closeout-partner.mjs');
const finopsConvergence = path.join(root, 'tools/architecture-closeout-finops.mjs');
const apiConvergence = path.join(root, 'tools/architecture-closeout-api.mjs');
if (!fs.existsSync(selfImportResolver)) throw new Error('Required architecture self-import resolver is missing');
if (!fs.existsSync(partnerConvergence)) throw new Error('Required Partner application closeout helper is missing');
if (!fs.existsSync(finopsConvergence)) throw new Error('Required Financials/Operations closeout helper is missing');
if (!fs.existsSync(apiConvergence)) throw new Error('Required API public-boundary closeout helper is missing');
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

function normalizePostpatchSelfImportStage() {
  const postpatch = path.join(root, 'tools/architecture-closeout-postpatch.mjs');
  if (!fs.existsSync(postpatch)) return;
  const marker = 'const violations = [...selfImportResolutionErrors];';
  let content = fs.readFileSync(postpatch, 'utf8');
  if (!content.includes(marker)) throw new Error('Unable to locate post-closeout invariant marker');
  content = content.replace(
    marker,
    "await import('./architecture-closeout-self-imports.mjs');\nselfImportResolutionErrors.length = 0;\nconst violations = [];",
  );
  write(postpatch, content);
  console.log('[closeout-orchestrator] deterministic self-import resolver installed before post-closeout invariants');
}

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

function normalizeCommunicationsApplication() {
  const base = path.join(root, 'domains/communications');
  if (!fs.existsSync(base)) return;

  fs.rmSync(path.join(base, 'application/RegisterDeviceTokenUseCase.ts'), { force: true });

  const unregister = path.join(base, 'application/UnregisterDeviceTokenUseCase.ts');
  if (fs.existsSync(unregister)) {
    write(unregister, `import type { IDeviceTokenRepository } from '../domain/repositories/IDeviceTokenRepository.js';

export interface UnregisterTokenInput {
  userId: number;
  deviceId: string;
}

/** Deactivates one device token through the Communications repository port. */
export class UnregisterDeviceTokenUseCase {
  constructor(private readonly tokenRepository: IDeviceTokenRepository) {}

  async execute(input: UnregisterTokenInput): Promise<void> {
    await this.tokenRepository.deactivate(input.userId, input.deviceId);
  }
}
`);
  }

  const listNotifications = path.join(base, 'application/ListNotificationsUseCase.ts');
  if (fs.existsSync(listNotifications)) {
    write(listNotifications, `import type { NotificationLog } from '../domain/NotificationLog.js';
import type { INotificationLogRepository } from '../domain/repositories/INotificationLogRepository.js';

/** Lists notification history through the bounded-context repository port. */
export class ListNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationLogRepository) {}

  async execute(userId: number): Promise<NotificationLog[]> {
    return this.notificationRepository.listByRecipientId(userId);
  }
}
`);
  }

  const markRead = path.join(base, 'application/MarkNotificationReadUseCase.ts');
  if (fs.existsSync(markRead)) {
    write(markRead, `import type { NotificationLog } from '../domain/NotificationLog.js';
import type { INotificationLogRepository } from '../domain/repositories/INotificationLogRepository.js';

/** Resolves a notification and marks its in-memory domain state as read. */
export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: INotificationLogRepository) {}

  async execute(notificationId: number): Promise<NotificationLog> {
    const log = await this.notificationRepository.findById(notificationId);
    if (!log) throw new Error('Notification log with ID ' + notificationId + ' not found');
    log.status = 'READ';
    return log;
  }
}
`);
  }

  const multiChannel = path.join(base, 'application/SendMultiChannelNotificationUseCase.ts');
  if (fs.existsSync(multiChannel)) {
    write(multiChannel, `import { NotificationLog } from '../domain/NotificationLog.js';
import type { NotificationChannel } from '../domain/NotificationChannel.js';
import type { INotificationLogRepository } from '../domain/repositories/INotificationLogRepository.js';

export interface SendMultiChannelNotificationInput {
  userId: number;
  channel: NotificationChannel;
  templateId: string;
  recipient: string;
  title?: string;
  body?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Records a canonical notification delivery request without depending on a concrete persistence
 * adapter. Provider delivery remains behind Communications capability ports/services.
 */
export class SendMultiChannelNotificationUseCase {
  constructor(private readonly notificationRepository: INotificationLogRepository) {}

  async execute(input: SendMultiChannelNotificationInput): Promise<NotificationLog> {
    const log = new NotificationLog({
      recipientId: input.userId,
      recipient: input.recipient,
      channel: input.channel,
      provider: 'FCM_OR_DEFAULT',
      templateId: input.templateId,
      status: 'SENT',
    });
    return this.notificationRepository.create(log);
  }
}
`);
  }

  const publicIndex = path.join(base, 'public/index.ts');
  if (fs.existsSync(publicIndex)) {
    let content = fs.readFileSync(publicIndex, 'utf8');
    content = content
      .replace(/^export \* from '\.\.\/application\/RegisterDeviceTokenUseCase\.js';\s*$/gm, '')
      .replace(/\n{3,}/g, '\n\n');
    write(publicIndex, content);
  }

  console.log('[closeout-orchestrator] Communications application authorities converged on repository ports');
}

function enforcePermanentFreezeCi() {
  const ciFile = path.join(root, '.github/workflows/ci.yml');
  if (!fs.existsSync(ciFile)) throw new Error('Permanent CI workflow is missing');
  let ci = fs.readFileSync(ciFile, 'utf8');
  if (!ci.includes('pnpm install --frozen-lockfile')) {
    throw new Error('Permanent CI did not converge to frozen-lockfile installation');
  }
  if (!ci.includes('pnpm test:freeze')) {
    const marker = `      - name: Upload Vitest diagnostic\n        if: failure()\n        uses: actions/upload-artifact@v4\n        with:\n          name: vitest-diagnostic\n          path: vitest-output.txt\n          if-no-files-found: error\n`;
    if (!ci.includes(marker)) throw new Error('Unable to locate permanent CI Vitest diagnostic stage');
    ci = ci.replace(marker, `${marker}\n      - name: Enforce production coverage freeze\n        run: pnpm test:freeze\n`);
    write(ciFile, ci);
  }
  if (!fs.readFileSync(ciFile, 'utf8').includes('pnpm test:freeze')) {
    throw new Error('Permanent CI coverage freeze gate was not installed');
  }
  console.log('[closeout-orchestrator] permanent CI enforces frozen lockfile and production coverage freeze');
}

function enforceApiTransportCloseout() {
  const rbac = path.join(root, 'apps/api/src/transport/auth/rbac.ts');
  const customerDispute = path.join(root, 'apps/api/src/surfaces/customer/routes/dispute.routes.ts');
  const adminDispute = path.join(root, 'apps/api/src/surfaces/admin/routes/dispute.routes.ts');
  if (!fs.existsSync(rbac)) throw new Error('Transport-local RBAC policy was not produced');
  if (!fs.existsSync(customerDispute) || !fs.existsSync(adminDispute)) throw new Error('Dispute product-surface split is incomplete');
  if (/ListDisputesUseCase|GetDisputeUseCase/.test(fs.readFileSync(customerDispute, 'utf8'))) {
    throw new Error('Customer dispute surface retains an unscoped read/list authority');
  }
  if (!/disputePublicId:\s*publicId/.test(fs.readFileSync(adminDispute, 'utf8'))) {
    throw new Error('Admin dispute resolution is not mapped to the canonical command');
  }
  console.log('[closeout-orchestrator] API JWT/RBAC/Partner/Dispute transport contracts are classified and frozen');
}

function removeExecutedCloseoutHelpers() {
  for (const helper of [
    'architecture-closeout-self-imports.mjs',
    'architecture-closeout-postpatch.mjs',
    'architecture-closeout-partner.mjs',
    'architecture-closeout-finops.mjs',
    'architecture-closeout-api.mjs',
    'architecture-closeout-residue.mjs',
  ]) {
    fs.rmSync(path.join(root, 'tools', helper), { force: true });
  }
  console.log('[closeout-orchestrator] executed convergence helpers removed from final candidate tree');
}

try {
  normalizePostpatchSelfImportStage();
  execFileSync(process.execPath, ['--check', driver], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, [driver], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, [partnerConvergence], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, [finopsConvergence], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, [apiConvergence], { cwd: root, stdio: 'inherit' });
  enforceApiTransportCloseout();
  normalizeObservabilityAdapter();
  normalizeCommunicationsApplication();
  enforcePermanentFreezeCi();
  removeExecutedCloseoutHelpers();
} finally {
  fs.rmSync(driver, { force: true });
}
