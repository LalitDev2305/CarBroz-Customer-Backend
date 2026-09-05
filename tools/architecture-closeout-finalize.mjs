import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const apiSource = path.join(root, 'apps/api/src');
const surfaces = path.join(apiSource, 'surfaces');

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return entry.isFile() && entry.name.endsWith('.ts') ? [absolute] : [];
  });
};

function normalizeFinalSourceContracts() {
  write(path.join(root, 'foundation/kernel/src/application/contracts.ts'), `/** Stable actor kinds understood across bounded contexts. */
export type ActorKind = 'GUEST' | 'CUSTOMER' | 'PARTNER' | 'ADMIN' | 'SYSTEM';

/** Transport-neutral authenticated actor identity. */
export interface ActorContext {
  readonly id: number;
  readonly kind: ActorKind;
  readonly roles: readonly string[];
  readonly customerId?: number;
  readonly partnerId?: number;
  readonly tenantId?: string;
}

/** Transport-neutral execution metadata propagated across application boundaries. */
export interface ExecutionContext {
  readonly correlationId: string;
  readonly actor: ActorContext;
  readonly timestamp: Date;
}

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput, context?: ExecutionContext): Promise<TOutput>;
}
export type TransactionContext = unknown;
export interface ITransactionProvider {
  runInTransaction<T>(work: (transaction?: TransactionContext) => Promise<T>): Promise<T>;
}
export interface IClockProvider { now(): Date }
export interface IIdGeneratorProvider { generate(): string }
`);

  const identityPublic = path.join(root, 'domains/identity/public/index.ts');
  if (fs.existsSync(identityPublic)) {
    const cleaned = fs.readFileSync(identityPublic, 'utf8')
      .split('\n')
      .filter((line) => !line.includes('/infrastructure/'))
      .join('\n');
    write(identityPublic, cleaned);
  }

  write(path.join(root, 'domains/financials/financials.module.ts'), `import { asClass, type AwilixContainer } from 'awilix';
import { TaxCalculator } from './domain/TaxCalculator.js';
import { registerPaymentModule } from './payment/payment.module.js';
import { registerInvoiceModule } from './invoice/invoice.module.js';
import { registerPayoutModule } from './payout/payout.module.js';

export function registerFinancialsModule(container: AwilixContainer): void {
  container.register({ taxCalculator: asClass(TaxCalculator).singleton() });
  registerPaymentModule(container);
  registerInvoiceModule(container);
  registerPayoutModule(container);
}
`);

  const bookingUseCases = path.join(root, 'domains/booking/application/BookingUseCases.ts');
  if (fs.existsSync(bookingUseCases)) {
    let source = fs.readFileSync(bookingUseCases, 'utf8');
    source = source.replace(/\nexport class AssignPartnerToBookingUseCase \{[\s\S]*?\n\}\n\nexport interface TransitionBookingStatusInput/, '\nexport interface TransitionBookingStatusInput');
    source = source.replace(/^import type \{ IPartnerRepository \} from '@carbroz\/domain-partner';\n/m, '');
    write(bookingUseCases, source);
  }

  const operationsPackageFile = path.join(root, 'domains/operations/package.json');
  if (fs.existsSync(operationsPackageFile)) {
    const manifest = JSON.parse(fs.readFileSync(operationsPackageFile, 'utf8'));
    manifest.dependencies ??= {};
    manifest.dependencies['@carbroz/domain-booking'] = 'workspace:*';
    manifest.dependencies['@carbroz/domain-partner'] = 'workspace:*';
    write(operationsPackageFile, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  write(path.join(root, 'domains/operations/application/dispatch/AssignPartnerToBookingUseCase.ts'), `import type { IBookingRepository } from '@carbroz/domain-booking';
import type { IPartnerRepository } from '@carbroz/domain-partner';
import type { Booking } from '@carbroz/domain-booking';

/** Operations owns dispatch/assignment; Booking owns only booking lifecycle state. */
export class AssignPartnerToBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(bookingPublicId: string, partnerId: number, adminUserId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findByPublicId(bookingPublicId);
    if (!booking) throw new Error('Booking not found');
    const partner = await this.partnerRepository.findById(partnerId);
    if (!partner || partner.status !== 'ACTIVE') throw new Error('Partner not found or not active');
    const conflicting = await this.bookingRepository.findConflictingPartnerBooking(
      partnerId,
      booking.slotStartTime,
      booking.slotEndTime,
      booking.id,
    );
    if (conflicting) throw new Error('Partner has a conflicting booking assignment during this time slot');
    booking.assignPartner(partnerId, adminUserId);
    return this.bookingRepository.update(booking);
  }
}
`);

  const operationsPublic = path.join(root, 'domains/operations/public/index.ts');
  if (fs.existsSync(operationsPublic)) {
    let source = fs.readFileSync(operationsPublic, 'utf8');
    if (!source.includes('AssignPartnerToBookingUseCase')) source += "\nexport * from '../application/dispatch/AssignPartnerToBookingUseCase.js';\n";
    write(operationsPublic, source);
  }

  console.log('[architecture-closeout-finalize] strict ExecutionContext, clean Identity public boundary, Financials tax DI and Operations dispatch ownership normalized');
}

function normalizeRootTestHarness() {
  const packageFile = path.join(root, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  manifest.devDependencies ??= {};
  for (const packageName of [
    '@carbroz/domain-audit', '@carbroz/domain-booking', '@carbroz/domain-catalog-pricing',
    '@carbroz/domain-communications', '@carbroz/domain-configuration', '@carbroz/domain-customer',
    '@carbroz/domain-dispute', '@carbroz/domain-engagement', '@carbroz/domain-enterprise',
    '@carbroz/domain-financials', '@carbroz/domain-identity', '@carbroz/domain-operations',
    '@carbroz/domain-partner', '@carbroz/foundation-kernel', '@carbroz/platform-integrations',
    '@carbroz/sdui-registry', '@carbroz/ui-sdk',
  ]) manifest.devDependencies[packageName] = 'workspace:*';
  write(packageFile, `${JSON.stringify(manifest, null, 2)}\n`);

  const commonRewrites = new Map([
    ['tests/integration/domain/audit.test.ts', '@carbroz/domain-audit'],
    ['tests/integration/domain/corporate.test.ts', '@carbroz/domain-enterprise'],
    ['tests/integration/domain/coupon.test.ts', '@carbroz/domain-engagement'],
    ['tests/integration/domain/notification.test.ts', '@carbroz/domain-communications'],
    ['tests/integration/domain/review.test.ts', '@carbroz/domain-engagement'],
    ['tests/integration/domain/tracking.test.ts', '@carbroz/domain-operations'],
  ]);

  for (const [relative, target] of commonRewrites) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replaceAll('../../../packages/common/src/index.js', target);
    content = content.replaceAll('../../../packages/common/src/index.ts', target);
    write(file, content);
  }

  const disputeTest = path.join(root, 'tests/integration/domain/dispute.test.ts');
  if (fs.existsSync(disputeTest)) {
    let content = fs.readFileSync(disputeTest, 'utf8');
    content = content.replace(
      /import\s*\{\s*Dispute\s*,\s*DisputeSettlementCalculator\s*,\s*Money\s*\}\s*from\s*['"]\.\.\/\.\.\/\.\.\/packages\/common\/src\/index\.js['"];?/,
      "import { Dispute, DisputeSettlementCalculator } from '@carbroz/domain-dispute';\nimport { Money } from '@carbroz/foundation-kernel';",
    );
    write(disputeTest, content);
  }

  const integrationTests = walk(path.join(root, 'tests/integration'));
  const legacyImports = integrationTests.filter((file) => fs.readFileSync(file, 'utf8').includes('packages/common'));
  if (legacyImports.length) throw new Error(`Legacy Common imports remain in final integration tests:\n${legacyImports.map((file) => path.relative(root, file)).join('\n')}`);
  console.log('[architecture-closeout-finalize] root test harness consumes canonical workspace contracts only');
}

function migrateCanonicalBehaviorTests() {
  const simpleMoneyFiles = [
    'tests/integration/domain/money.test.ts',
    'tests/integration/domain/tax-calculator.test.ts',
    'tests/integration/domain/dispute.test.ts',
  ];
  for (const relative of simpleMoneyFiles) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) continue;
    let source = fs.readFileSync(file, 'utf8');
    source = source.replaceAll('Money.fromPaise(', 'Money.fromMinor(').replaceAll('.amountPaise', '.amountMinor');
    write(file, source);
  }

  for (const relative of ['tests/integration/application/dispute-engine.test.ts', 'tests/integration/application/review-coupon-engine.test.ts', 'tests/integration/domain/coupon.test.ts']) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) continue;
    let source = fs.readFileSync(file, 'utf8');
    source = source
      .replaceAll('requestedRefundAmount.amountPaise', 'requestedRefundAmount.amountMinor')
      .replaceAll('refundedAmount.amountPaise', 'refundedAmount.amountMinor')
      .replaceAll('discountMoney.amountPaise', 'discountMoney.amountMinor')
      .replaceAll('finalPriceMoney.amountPaise', 'finalPriceMoney.amountMinor');
    write(file, source);
  }

  const corporate = path.join(root, 'tests/integration/domain/corporate.test.ts');
  if (fs.existsSync(corporate)) {
    let source = fs.readFileSync(corporate, 'utf8');
    source = source.replaceAll('Money.fromPaise(', 'Money.fromMinor(').replaceAll('availableCredit.amountPaise', 'availableCredit.amountMinor');
    write(corporate, source);
  }

  const booking = path.join(root, 'tests/integration/application/booking-use-cases.test.ts');
  if (fs.existsSync(booking)) {
    let source = fs.readFileSync(booking, 'utf8');
    source = source.replace(/AssignPartnerToBookingUseCase([^}]*)\}\s*from\s*'@carbroz\/domain-booking'/s, (match) => match.replace(/\s*AssignPartnerToBookingUseCase\s*,?/, ''));
    if (!source.includes("AssignPartnerToBookingUseCase } from '@carbroz/domain-operations'")) {
      source = "import { AssignPartnerToBookingUseCase } from '@carbroz/domain-operations';\n" + source;
    }
    write(booking, source);
  }

  const payment = path.join(root, 'tests/integration/application/payment-engine-use-cases.test.ts');
  if (fs.existsSync(payment)) {
    let source = fs.readFileSync(payment, 'utf8');
    if (!source.includes("TaxCalculator } from '@carbroz/domain-financials'")) {
      source = "import { TaxCalculator } from '@carbroz/domain-financials';\n" + source;
    }
    source = source
      .replaceAll('checkoutParams.orderId', 'checkoutParams.providerOrderId')
      .replace(/new GenerateInvoiceUseCase\(([^,\n]+),\s*([^,\)\n]+)\)/g, 'new GenerateInvoiceUseCase($1, $2, new TaxCalculator())')
      .replace(/new CreatePayoutEligibilityUseCase\(([^,\n]+),\s*([^,\)\n]+)\)/g, 'new CreatePayoutEligibilityUseCase($1, $2, new TaxCalculator())');
    write(payment, source);
  }

  console.log('[architecture-closeout-finalize] behavioral suites migrated to canonical Money, Financials DI and Operations dispatch ownership');
}

function ensureFinalTestLayers() {
  write(path.join(root, 'tests/contracts/canonical-public-contracts.contract.test.ts'), `import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
const publicEntries = [
  'domains/identity/public/index.ts', 'domains/partner/public/index.ts', 'domains/customer/public/index.ts',
  'domains/catalog-pricing/public/index.ts', 'domains/booking/public/index.ts', 'domains/operations/public/index.ts',
  'domains/financials/public/index.ts', 'domains/communications/public/index.ts', 'domains/engagement/public/index.ts',
  'domains/configuration/public/index.ts', 'domains/dispute/public/index.ts', 'domains/enterprise/public/index.ts',
  'domains/audit/public/index.ts', 'sdui/registry/public/index.ts',
] as const;
describe('canonical public contracts', () => {
  it('publishes deliberate bounded-context entry points without concrete infrastructure', () => {
    for (const entry of publicEntries) {
      const file = path.join(root, entry);
      expect(fs.existsSync(file), entry).toBe(true);
      const source = fs.readFileSync(file, 'utf8');
      expect(source, entry).not.toContain('/infrastructure/');
      expect(source, entry).not.toContain('@prisma/client');
    }
  });
  it('keeps universal Money and strict ExecutionContext authority in Foundation', () => {
    const money = fs.readFileSync(path.join(root, 'foundation/kernel/src/domain/Money.ts'), 'utf8');
    const contracts = fs.readFileSync(path.join(root, 'foundation/kernel/src/application/contracts.ts'), 'utf8');
    expect(money).toContain('class Money');
    expect(money).toContain('amountMinor');
    expect(contracts).toContain('interface ExecutionContext');
    expect(contracts).toContain('actor: ActorContext');
    expect(contracts).toContain('id: number');
    expect(contracts).not.toContain('actor?:');
  });
});
`);

  write(path.join(root, 'tests/e2e/api-health.e2e.test.ts'), `import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../apps/api/src/bootstrap/app.js';
let app: Awaited<ReturnType<typeof buildApp>> | undefined;
afterEach(async () => { if (app) await app.close(); app = undefined; });
describe('API executable E2E', () => {
  it('boots the final composition root and serves liveness through Fastify injection', async () => {
    app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/health/liveness' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
  });
  it('returns a transport-level 404 for an unknown route without leaking implementation details', async () => {
    app = await buildApp();
    const response = await app.inject({ method: 'GET', url: '/api/v1/customer/__contract_probe__' });
    expect(response.statusCode).toBe(404);
    expect(response.body).not.toContain('node_modules');
    expect(response.body).not.toContain('Prisma');
  });
});
`);
  console.log('[architecture-closeout-finalize] contract and E2E test layers installed with executable evidence');
}

function ensureFinancialConfigurationRegression() {
  write(path.join(root, 'tests/contracts/financial-configuration.contract.test.ts'), `import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
describe('Financials configuration and composition contract', () => {
  it('preserves the frozen tax, commission, TDS and seller GSTIN defaults', () => {
    const source = fs.readFileSync(path.join(root, 'domains/financials/domain/FinancialConfiguration.ts'), 'utf8');
    for (const expected of ['cgstRatePercent: 9','sgstRatePercent: 9','igstRatePercent: 18','platformCommissionPercent: 15','tdsRatePercent: 1',"sellerGstin: '29AAAAA0000A1Z5'"]) expect(source).toContain(expected);
  });
  it('wires the tax calculator through the Financials composition module', () => {
    const source = fs.readFileSync(path.join(root, 'domains/financials/financials.module.ts'), 'utf8');
    expect(source).toContain('taxCalculator');
    expect(source).toContain('TaxCalculator');
  });
});
`);
  console.log('[architecture-closeout-finalize] Financials configuration and tax DI regression contract installed');
}

function normalizeRootReadme() {
  const file = path.join(root, 'README.md');
  if (!fs.existsSync(file)) throw new Error('Root README is missing after closeout');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/^# CarBroz Backend[^\n]*/m, '# CarBroz Backend V3 — Constitution-Frozen Architecture');
  if (!content.includes('Template -> Component -> Element')) content += `\n## Canonical SDUI composition\n\nThe minimum structural composition is **Template -> Component -> Element**. Optional Section and Group levels may be inserted only where the canonical UI SDK schema allows them.\n`;
  if (!content.includes('pnpm test:freeze')) content += `\n## Final validation gate\n\nBefore merge or architecture freeze run \`pnpm install --frozen-lockfile\`, Prisma validation/generation, \`pnpm -r build\`, \`pnpm lint\`, \`pnpm test -- --run\`, and finally \`pnpm test:freeze\`.\n`;
  write(file, content);
}

if (fs.existsSync(path.join(root, 'packages'))) throw new Error('Transitional top-level packages/ still exists after closeout');
const workspaceFile = path.join(root, 'pnpm-workspace.yaml');
const workspace = fs.existsSync(workspaceFile) ? fs.readFileSync(workspaceFile, 'utf8') : '';
for (const workspaceRoot of ['apps/*', 'domains/*', 'sdui/*', 'platform/*', 'foundation/*']) {
  if (!workspace.includes(`"${workspaceRoot}"`) && !workspace.includes(`'${workspaceRoot}'`) && !workspace.includes(`- ${workspaceRoot}`)) throw new Error(`Canonical workspace root missing after closeout: ${workspaceRoot}`);
}
if (/packages\/\*/.test(workspace)) throw new Error('pnpm workspace still includes transitional packages/*');

const architecturePolicies = ['tests/architecture/canonical-topology.policy.test.ts','tests/architecture/engineering-quality.policy.test.ts'];
for (const policy of architecturePolicies) if (!fs.existsSync(path.join(root, policy))) throw new Error(`Generated architecture policy missing: ${policy}`);
const eslintBinary = path.join(root, 'node_modules/.bin/eslint');
if (!fs.existsSync(eslintBinary)) throw new Error('Installed ESLint binary is unavailable for generated-policy validation');
execFileSync(eslintBinary, architecturePolicies, { cwd: root, stdio: 'inherit' });

const legacyApiRoots = ['modules', 'container', 'providers'];
const legacyResidue = legacyApiRoots.filter((name) => fs.existsSync(path.join(apiSource, name)));
if (legacyResidue.length) throw new Error(`Legacy API ownership roots remain after closeout: ${legacyResidue.join(', ')}`);

for (const name of ['review.dto.ts', 'coupon.dto.ts']) {
  const source = path.join(surfaces, 'customer/dto', name);
  const target = path.join(surfaces, 'admin/dto', name);
  if (fs.existsSync(source) && !fs.existsSync(target)) write(target, fs.readFileSync(source, 'utf8'));
}
for (const file of walk(path.join(surfaces, 'admin'))) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replaceAll('../../customer/dto/review.dto.js', '../dto/review.dto.js').replaceAll('../../customer/dto/coupon.dto.js', '../dto/coupon.dto.js');
  write(file, content);
}
const violations = [];
for (const owner of ['partner', 'customer', 'admin']) {
  for (const file of walk(path.join(surfaces, owner))) {
    const content = fs.readFileSync(file, 'utf8');
    for (const other of ['partner', 'customer', 'admin']) {
      if (other === owner) continue;
      const marker = new RegExp(`from\\s+['"][^'"]*(?:\\.\\./)+${other}/`);
      if (marker.test(content)) violations.push(`${path.relative(root, file)} imports ${other} surface internals`);
    }
  }
}
if (violations.length) throw new Error(`Product surface isolation failed:\n${violations.map((v) => `- ${v}`).join('\n')}`);

normalizeFinalSourceContracts();
normalizeRootTestHarness();
migrateCanonicalBehaviorTests();
ensureFinalTestLayers();
ensureFinancialConfigurationRegression();
normalizeRootReadme();
console.log('[architecture-closeout-finalize] canonical workspace, strict execution context, clean public boundaries, Operations dispatch, canonical behavior tests, product surfaces and README are frozen');
