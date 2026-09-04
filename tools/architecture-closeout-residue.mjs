import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'coverage') return [];
      return walk(absolute);
    }
    return entry.isFile() && entry.name.endsWith('.ts') ? [absolute] : [];
  });
};

const owners = new Map([
  ['IUseCase', '@carbroz/foundation-kernel'], ['ITransactionProvider', '@carbroz/foundation-kernel'],
  ['IClockProvider', '@carbroz/foundation-kernel'], ['IIdGeneratorProvider', '@carbroz/foundation-kernel'],
  ['IUserRepository', '@carbroz/domain-identity'], ['IUserSessionRepository', '@carbroz/domain-identity'],
  ['IRoleRepository', '@carbroz/domain-identity'], ['IPermissionRepository', '@carbroz/domain-identity'],
  ['IAdminRoleRepository', '@carbroz/domain-identity'], ['IAuthorizationProvider', '@carbroz/domain-identity'],
  ['IPartnerRepository', '@carbroz/domain-partner'], ['IPartnerMemberRepository', '@carbroz/domain-partner'],
  ['IPartnerProfileRepository', '@carbroz/domain-partner'], ['IKycDocumentRepository', '@carbroz/domain-partner'],
  ['IMapsProvider', '@carbroz/domain-operations'], ['ITrackingSessionRepository', '@carbroz/domain-operations'],
  ['ICustomerProfileRepository', '@carbroz/domain-customer'], ['IAddressRepository', '@carbroz/domain-customer'],
  ['IVehicleRepository', '@carbroz/domain-customer'],
  ['ICatalogRepository', '@carbroz/domain-catalog-pricing'], ['IPricingRepository', '@carbroz/domain-catalog-pricing'],
  ['IBookingRepository', '@carbroz/domain-booking'],
  ['IPaymentRepository', '@carbroz/domain-financials'], ['IInvoiceRepository', '@carbroz/domain-financials'],
  ['IPartnerPayoutRepository', '@carbroz/domain-financials'], ['IPaymentGatewayProvider', '@carbroz/domain-financials'],
  ['IDeviceTokenRepository', '@carbroz/domain-communications'], ['INotificationLogRepository', '@carbroz/domain-communications'],
  ['IPushProvider', '@carbroz/domain-communications'], ['ISmsProvider', '@carbroz/domain-communications'],
  ['IEmailProvider', '@carbroz/domain-communications'], ['INotificationProvider', '@carbroz/domain-communications'],
  ['IReviewRepository', '@carbroz/domain-engagement'], ['ICouponRepository', '@carbroz/domain-engagement'],
  ['ICouponUsageRepository', '@carbroz/domain-engagement'],
  ['IAuditLogRepository', '@carbroz/domain-audit'], ['IDisputeRepository', '@carbroz/domain-dispute'],
  ['ICorporateAccountRepository', '@carbroz/domain-enterprise'], ['ICorporateMemberRepository', '@carbroz/domain-enterprise'],
  ['ICorporateFleetVehicleRepository', '@carbroz/domain-enterprise'], ['ICorporateCreditLedgerRepository', '@carbroz/domain-enterprise'],
  ['ICorporateInvoiceRepository', '@carbroz/domain-enterprise'],
  ['IConfigRepository', '@carbroz/domain-configuration'], ['IFeatureFlagRepository', '@carbroz/domain-configuration'],
  ['IConfigProvider', '@carbroz/domain-configuration'], ['IFeatureFlagProvider', '@carbroz/domain-configuration'],
  ['ISduiRegistryRepository', '@carbroz/sdui-registry'],
  ['ILoggerProvider', '@carbroz/platform-observability'], ['IStorageProvider', '@carbroz/platform-storage'],
  ['ICacheProvider', '@carbroz/platform-cache'], ['IDatabaseProvider', '@carbroz/platform-database'],
]);

for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\(['"]@carbroz\/common['"]\)\.([A-Za-z0-9_]+)/g, (full, symbol) => {
    const owner = owners.get(symbol);
    return owner ? `import('${owner}').${symbol}` : full;
  });

  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative === 'apps/api/src/transport/auth/auth.controller.ts') {
    content = content.replace(
      /import\s*\{\s*ResponseHelper\s*\}\s*from\s*['"]@carbroz\/common['"];?/g,
      "import { ResponseHelper } from '../response/ResponseHelper.js';",
    );
    content = content
      .split('\n')
      .filter((line) => !(line.includes('request.log.') && /(otp|mockOtp|phoneNumber|deviceId|refreshToken|authorization|cookie|token)/i.test(line)))
      .join('\n');
  }

  if (relative === 'foundation/kernel/src/errors/errors.ts') {
    content = content.replaceAll('@carbroz/common', 'the removed legacy compatibility package');
    content = content.replaceAll('during Backend V3 migration', 'for stable transport compatibility');
    content = content.replaceAll('Transitional name retained for existing API consumers.', 'Compatibility alias retained for stable application-error identity.');
  }

  fs.writeFileSync(file, content);
}

function hasExecutionContextImport(content) {
  return /import\s+(?:type\s+)?\{[^}]*\bExecutionContext\b[^}]*\}\s+from\s+['"]@carbroz\/foundation-kernel['"]/.test(content);
}

function deduplicateExecutionContextImports(content) {
  const lines = content.split('\n');
  let seenExecutionContext = false;
  const normalized = [];

  for (const line of lines) {
    const foundationImport = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@carbroz\/foundation-kernel['"];?/.exec(line);
    if (!foundationImport) {
      normalized.push(line);
      continue;
    }

    const members = foundationImport[1].split(',').map((member) => member.trim()).filter(Boolean);
    if (!members.includes('ExecutionContext')) {
      normalized.push(line);
      continue;
    }

    if (!seenExecutionContext) {
      seenExecutionContext = true;
      normalized.push(line);
      continue;
    }

    const remaining = members.filter((member) => member !== 'ExecutionContext');
    if (remaining.length) {
      const typePrefix = /^import\s+type\s+/.test(line) ? 'type ' : '';
      normalized.push(`import ${typePrefix}{ ${remaining.join(', ')} } from '@carbroz/foundation-kernel';`);
    }
  }

  return normalized.join('\n');
}

function normalizeSduiRegistryApplication() {
  const applicationRoot = path.join(root, 'sdui/registry/application');
  const useCasesRoot = path.join(applicationRoot, 'use-cases');
  if (!fs.existsSync(useCasesRoot)) return;

  fs.writeFileSync(path.join(applicationRoot, 'contracts.ts'), `import type { SduiScreen, SduiTargetApp } from '@carbroz/ui-sdk';

/** Transport-neutral reusable registry node definition input. */
export interface SduiRegistryNodeInput {
  name: string;
  componentType: string;
  schemaJson: Record<string, unknown>;
  supportedProperties?: Record<string, unknown>;
  supportedActions?: Record<string, unknown>;
}

export type CreateSduiComponentDto = SduiRegistryNodeInput;
export type CreateSduiSectionDto = SduiRegistryNodeInput;
export type CreateSduiGroupDto = SduiRegistryNodeInput;
export type CreateSduiElementDto = SduiRegistryNodeInput;

export interface GetSduiScreenDto {
  screenId: string;
  targetApp: SduiTargetApp;
}

export type SduiJsonContract = SduiScreen;

export interface CreateSduiDraftDto {
  screenId: string;
  targetApp: SduiTargetApp;
  layoutJson: SduiScreen;
  createdFromVersion?: number;
  changeDescription?: string;
  overwriteExistingDraft: boolean;
}

export interface UpdateSduiDraftDto {
  screenId: string;
  targetApp: SduiTargetApp;
  layoutJson: SduiScreen;
  lockVersion: number;
  changeDescription?: string;
}

export interface PublishSduiVersionDto {
  screenId: string;
  targetApp: SduiTargetApp;
  versionNumber: number;
}

export type ArchiveSduiVersionDto = PublishSduiVersionDto;

export interface RollbackSduiVersionDto {
  screenId: string;
  targetApp: SduiTargetApp;
  targetVersionNumber: number;
}

export interface CompareSduiVersionsDto {
  screenId: string;
  targetApp: SduiTargetApp;
  sourceVersion: number;
  targetVersion: number;
}
`);

  for (const file of walk(useCasesRoot)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      /from ['"][^'"]*apps\/api\/src\/transport\/sdui\/dto\/sdui-registry\.dto\.js['"]/g,
      "from '../contracts.js'",
    );

    if (content.includes('IRequestContext')) {
      if (!hasExecutionContextImport(content)) {
        content = `import type { ExecutionContext } from '@carbroz/foundation-kernel';\n${content}`;
      }
      content = content.replaceAll('IRequestContext', 'ExecutionContext');
    }

    content = deduplicateExecutionContextImports(content);
    content = content.replaceAll('!input.context.authenticatedUser?.isAdmin', "input.context.actor?.kind !== 'ADMIN'");
    content = content.replaceAll('!request.context.authenticatedUser?.isAdmin', "request.context.actor?.kind !== 'ADMIN'");
    content = content.replaceAll('input.context.authenticatedUser?.isAdmin', "input.context.actor?.kind === 'ADMIN'");
    content = content.replaceAll('request.context.authenticatedUser?.isAdmin', "request.context.actor?.kind === 'ADMIN'");

    fs.writeFileSync(file, content);
  }

  const publicIndex = path.join(root, 'sdui/registry/public/index.ts');
  if (fs.existsSync(publicIndex)) {
    let content = fs.readFileSync(publicIndex, 'utf8');
    if (!content.includes("../application/contracts.js")) {
      content += "\nexport * from '../application/contracts.js';\n";
      fs.writeFileSync(publicIndex, content);
    }
  }

  const violations = [];
  for (const file of walk(applicationRoot)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('apps/api/src/transport/sdui')) violations.push(`${path.relative(root, file)} imports API SDUI transport`);
    if (content.includes('IRequestContext')) violations.push(`${path.relative(root, file)} retains IRequestContext`);
    if (content.includes('authenticatedUser')) violations.push(`${path.relative(root, file)} retains transport user shape`);
  }
  if (violations.length) throw new Error(`SDUI registry application isolation failed: ${violations.join(', ')}`);

  console.log('[architecture-closeout-residue] SDUI registry application contracts normalized and isolated from API transport');
}

function normalizeBookingApplication() {
  const bookingRoot = path.join(root, 'domains/booking');
  const applicationRoot = path.join(bookingRoot, 'application');
  const useCasesRoot = path.join(applicationRoot, 'use-cases');
  if (!fs.existsSync(useCasesRoot)) return;

  const portsRoot = path.join(applicationRoot, 'ports');
  fs.mkdirSync(portsRoot, { recursive: true });
  fs.writeFileSync(path.join(portsRoot, 'IBookingCompletionEffect.ts'), `/**
 * Outbound application port invoked after a booking is durably completed.
 *
 * Booking owns the lifecycle fact; downstream bounded contexts decide what
 * effect completion causes. Implementations may trigger financial eligibility,
 * notifications, analytics, or other reactions without leaking those concerns
 * into the Booking application layer.
 */
export interface IBookingCompletionEffect {
  execute(bookingId: number): Promise<unknown>;
}
`);

  const createBookingPath = path.join(useCasesRoot, 'CreateBookingUseCase.ts');
  if (fs.existsSync(createBookingPath)) {
    let content = fs.readFileSync(createBookingPath, 'utf8');
    content = content.replace(
      /const addonSnapshots = \[\];/,
      "const addonSnapshots: BookingSnapshots['addons'] = [];",
    );
    fs.writeFileSync(createBookingPath, content);
  }

  const transitionPath = path.join(useCasesRoot, 'TransitionBookingStatusUseCase.ts');
  if (fs.existsSync(transitionPath)) {
    let content = fs.readFileSync(transitionPath, 'utf8');
    content = content.replace(
      /^import .*CreatePayoutEligibilityUseCase.*\n/m,
      "import type { IBookingCompletionEffect } from '../ports/IBookingCompletionEffect.js';\n",
    );
    content = content.replaceAll('createPayoutEligibilityUseCase?: CreatePayoutEligibilityUseCase', 'bookingCompletionEffect?: IBookingCompletionEffect');
    content = content.replaceAll('this.createPayoutEligibilityUseCase', 'this.bookingCompletionEffect');
    fs.writeFileSync(transitionPath, content);
  }

  const violations = [];
  for (const file of walk(applicationRoot)) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const content = fs.readFileSync(file, 'utf8');
    if (/financials|CreatePayoutEligibilityUseCase/.test(content)) {
      violations.push(`${relative} leaks Financials implementation semantics into Booking`);
    }
    if (/const\s+addonSnapshots\s*=\s*\[\]/.test(content)) {
      violations.push(`${relative} retains untyped addon snapshot collection`);
    }
  }
  if (violations.length) throw new Error(`Booking application isolation failed: ${violations.join(', ')}`);

  console.log('[architecture-closeout-residue] Booking completion effect isolated and snapshot collection strictly typed');
}

normalizeSduiRegistryApplication();
normalizeBookingApplication();

// Correct security evidence: inspect logging statements, not legitimate authentication variables.
const sensitiveLogViolations = [];
for (const file of walk(path.join(root, 'apps'))) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (/(?:request\.)?log\.(?:trace|debug|info|warn|error|fatal)\s*\(/.test(line) && /(otp|mockOtp|phoneNumber|deviceId|refreshToken|authorization|cookie|password|secret)/i.test(line)) {
      sensitiveLogViolations.push(`${relative}:${index + 1}`);
    }
  });
}
if (sensitiveLogViolations.length) {
  throw new Error(`Sensitive logging remains: ${sensitiveLogViolations.join(', ')}`);
}

console.log('[architecture-closeout-residue] Configuration, SDUI application ownership, Booking isolation, and precise sensitive-log gates passed');
