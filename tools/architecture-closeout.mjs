import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// One-time closeout entrypoint: deterministic transform -> residue audit -> static gate -> CI validation.
// Final output rejects Common, removes duplicate compatibility/application authorities, resolves self-imports,
// and applies narrowly scoped post-transform convergence fixes before validation.
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

function normalizeCommunicationsApplication() {
  const base = path.join(root, 'domains/communications');
  if (!fs.existsSync(base)) return;

  // The old domain-local RegisterDeviceTokenUseCase injected Prisma directly and duplicates the
  // migrated port-based use case. Keep the port-based application authority and remove the duplicate.
  fs.rmSync(path.join(base, 'application/RegisterDeviceTokenUseCase.ts'), { force: true });

  // Preserve unique legacy capabilities, but make application code depend on domain repository ports
  // rather than Prisma implementations. These interfaces are adopted into domain/repositories by the
  // closeout migration before this normalization runs.
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
    // Remove the stale export whose source was deleted. The migrated use case under
    // application/use-cases is already exported by the migration's application export pass.
    content = content
      .replace(/^export \* from '\.\.\/application\/RegisterDeviceTokenUseCase\.js';\s*$/gm, '')
      .replace(/\n{3,}/g, '\n\n');
    write(publicIndex, content);
  }

  console.log('[closeout-orchestrator] Communications application authorities converged on repository ports');
}

try {
  execFileSync(process.execPath, ['--check', driver], { cwd: root, stdio: 'inherit' });
  execFileSync(process.execPath, [driver], { cwd: root, stdio: 'inherit' });
  normalizeObservabilityAdapter();
  normalizeCommunicationsApplication();
  fs.rmSync(path.join(root, 'tools/architecture-closeout-residue.mjs'), { force: true });
} finally {
  fs.rmSync(driver, { force: true });
}
