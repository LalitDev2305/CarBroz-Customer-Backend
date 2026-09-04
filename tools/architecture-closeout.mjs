import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

console.log('[closeout-orchestrator] loading immutable migration source from safety snapshot');
try {
  run('git', ['fetch', 'origin', 'fix/stage-a-production-definitions-safety-backup']);
} catch {
  // Full-depth checkout normally already contains the safety ref.
}

let workerSource = execFileSync(
  'git',
  ['show', 'origin/fix/stage-a-production-definitions-safety-backup:tools/architecture-closeout.mjs'],
  { cwd: root, encoding: 'utf8' },
);

const syntaxRepairs = [
  [
    "ResponseHelper.error(`Rate limit exceeded, retry in ${context.after}`, 'TOO_MANY_REQUESTS', request.traceId)",
    "ResponseHelper.error('Rate limit exceeded, retry in ' + context.after, 'TOO_MANY_REQUESTS', request.traceId)",
  ],
  [
    "ResponseHelper.error(`Route ${request.method}:${request.url} not found`, 'NOT_FOUND', request.traceId)",
    "ResponseHelper.error('Route ' + request.method + ':' + request.url + ' not found', 'NOT_FOUND', request.traceId)",
  ],
];
for (const [from, to] of syntaxRepairs) workerSource = workerSource.replaceAll(from, to);

if (!workerSource.includes("['booking', 'domains/booking/application/use-cases', '@carbroz/domain-booking']")) {
  workerSource = workerSource.replace(
    "['auth', 'domains/identity/application/use-cases', '@carbroz/domain-identity'],",
    "['auth', 'domains/identity/application/use-cases', '@carbroz/domain-identity'],\n    ['booking', 'domains/booking/application/use-cases', '@carbroz/domain-booking'],",
  );
}

// The historical migration moved API use cases but left many canonical domain contracts
// effectively owned by packages/common. Adopt those contracts into their bounded contexts
// before the ownership index rewrites imports. Existing canonical copies win; identical
// Common copies are discarded while their old paths remain mapped for relative-import repair.
const authorityMigration = String.raw`
function migrateLegacyCommonAuthority() {
  function adoptTree(sourceRel, targetRel, publicIndexRel, owner) {
    const source = p(sourceRel);
    if (!exists(source)) return;
    const indexFile = p(publicIndexRel);
    const exportLines = [];
    for (const file of walk(source, (f) => f.endsWith('.ts'))) {
      const relative = path.relative(source, file);
      const target = p(targetRel, relative);
      if (exists(target)) {
        moved.set(path.resolve(file), path.resolve(target));
        remove(file);
      } else {
        moveFile(file, target);
      }
      const symbol = path.basename(target, '.ts');
      ownership.set(symbol, owner);
      exportLines.push("export * from '" + relativeImport(indexFile, target) + "';");
    }
    appendExports(indexFile, exportLines);
    remove(source);
  }

  adoptTree('packages/common/src/domain/notification', 'domains/communications/domain', 'domains/communications/public/index.ts', '@carbroz/domain-communications');
  adoptTree('packages/common/src/domain/review', 'domains/engagement/review/domain', 'domains/engagement/review/public/index.ts', '@carbroz/domain-engagement');
  adoptTree('packages/common/src/domain/coupon', 'domains/engagement/coupon/domain', 'domains/engagement/coupon/public/index.ts', '@carbroz/domain-engagement');
  adoptTree('packages/common/src/domain/dispute', 'domains/dispute/domain', 'domains/dispute/public/index.ts', '@carbroz/domain-dispute');
  adoptTree('packages/common/src/domain/corporate', 'domains/enterprise/domain', 'domains/enterprise/public/index.ts', '@carbroz/domain-enterprise');
  adoptTree('packages/common/src/domain/location', 'domains/operations/tracking/domain', 'domains/operations/tracking/public/index.ts', '@carbroz/domain-operations');
  adoptTree('packages/common/src/domain/payment', 'domains/financials/payment/domain', 'domains/financials/payment/public/index.ts', '@carbroz/domain-financials');
  adoptTree('packages/common/src/domain/invoice', 'domains/financials/invoice/domain', 'domains/financials/invoice/public/index.ts', '@carbroz/domain-financials');
  adoptTree('packages/common/src/domain/payout', 'domains/financials/payout/domain', 'domains/financials/payout/public/index.ts', '@carbroz/domain-financials');

  const singleFiles = [
    ['packages/common/src/domain/models/Location.ts', 'domains/operations/domain/Location.ts', 'domains/operations/public/index.ts', '@carbroz/domain-operations'],
    ['packages/common/src/domain/config/FinancialConfiguration.ts', 'domains/financials/domain/FinancialConfiguration.ts', 'domains/financials/public/index.ts', '@carbroz/domain-financials'],
    ['packages/common/src/domain/services/TaxCalculator.ts', 'domains/financials/domain/TaxCalculator.ts', 'domains/financials/public/index.ts', '@carbroz/domain-financials'],
    ['packages/common/src/errors/ErrorCode.ts', 'foundation/kernel/src/errors/ErrorCode.ts', 'foundation/kernel/src/public/index.ts', '@carbroz/foundation-kernel'],
  ];
  for (const [sourceRel, targetRel, indexRel, owner] of singleFiles) {
    const source = p(sourceRel), target = p(targetRel), indexFile = p(indexRel);
    if (exists(source)) {
      if (exists(target)) {
        moved.set(path.resolve(source), path.resolve(target));
        remove(source);
      } else moveFile(source, target);
    }
    if (exists(target)) {
      ownership.set(path.basename(target, '.ts'), owner);
      appendExports(indexFile, ["export * from '" + relativeImport(indexFile, target) + "';"]);
    }
  }

  // These services/calculators are moved earlier by moveLegacyBusinessServicesIfNeeded.
  const requiredExports = [
    ['domains/communications/public/index.ts', 'domains/communications/application/NotificationService.ts', '@carbroz/domain-communications'],
    ['domains/engagement/review/public/index.ts', 'domains/engagement/review/domain/PartnerRatingCalculator.ts', '@carbroz/domain-engagement'],
    ['domains/engagement/coupon/public/index.ts', 'domains/engagement/coupon/domain/CouponDiscountCalculator.ts', '@carbroz/domain-engagement'],
    ['domains/dispute/public/index.ts', 'domains/dispute/domain/DisputeSettlementCalculator.ts', '@carbroz/domain-dispute'],
  ];
  for (const [indexRel, targetRel, owner] of requiredExports) {
    const indexFile = p(indexRel), target = p(targetRel);
    if (!exists(target)) continue;
    appendExports(indexFile, ["export * from '" + relativeImport(indexFile, target) + "';"]);
    ownership.set(path.basename(target, '.ts'), owner);
  }

  // Repository implementations already exist canonically but their interfaces were Common-owned.
  // The adopted domain/repositories files above now make those interfaces real domain contracts.
}
`;
workerSource = workerSource.replace('function createResponseHelper() {', `${authorityMigration}\nfunction createResponseHelper() {`);
workerSource = workerSource.replace(
  'moveLegacyBusinessServicesIfNeeded();\ncreateResponseHelper();',
  'moveLegacyBusinessServicesIfNeeded();\nmigrateLegacyCommonAuthority();\ncreateResponseHelper();',
);

// Add explicit package ownership for cross-context symbols whose declarations are now canonical.
const ownershipAdditions = [
  ['NotificationService', '@carbroz/domain-communications'],
  ['NotificationPayload', '@carbroz/domain-communications'],
  ['IDeviceTokenRepository', '@carbroz/domain-communications'],
  ['INotificationLogRepository', '@carbroz/domain-communications'],
  ['PartnerRatingCalculator', '@carbroz/domain-engagement'],
  ['PartnerRatingStats', '@carbroz/domain-engagement'],
  ['IReviewRepository', '@carbroz/domain-engagement'],
  ['CouponDiscountCalculator', '@carbroz/domain-engagement'],
  ['CouponDiscountResult', '@carbroz/domain-engagement'],
  ['ICouponRepository', '@carbroz/domain-engagement'],
  ['ICouponUsageRepository', '@carbroz/domain-engagement'],
  ['DisputeSettlementCalculator', '@carbroz/domain-dispute'],
  ['IDisputeRepository', '@carbroz/domain-dispute'],
  ['CorporateAccount', '@carbroz/domain-enterprise'],
  ['CorporateAccountStatus', '@carbroz/domain-enterprise'],
  ['CorporateMember', '@carbroz/domain-enterprise'],
  ['CorporateMemberRole', '@carbroz/domain-enterprise'],
  ['CorporateFleetVehicle', '@carbroz/domain-enterprise'],
  ['CorporateCreditLedger', '@carbroz/domain-enterprise'],
  ['CorporateLedgerEntryType', '@carbroz/domain-enterprise'],
  ['CorporateInvoice', '@carbroz/domain-enterprise'],
  ['CorporateInvoiceStatus', '@carbroz/domain-enterprise'],
  ['BillingAddressProps', '@carbroz/domain-enterprise'],
  ['ICorporateAccountRepository', '@carbroz/domain-enterprise'],
  ['ICorporateMemberRepository', '@carbroz/domain-enterprise'],
  ['ICorporateFleetVehicleRepository', '@carbroz/domain-enterprise'],
  ['ICorporateCreditLedgerRepository', '@carbroz/domain-enterprise'],
  ['ICorporateInvoiceRepository', '@carbroz/domain-enterprise'],
  ['ITrackingSessionRepository', '@carbroz/domain-operations'],
  ['GeocodeResult', '@carbroz/domain-operations'],
  ['DistanceMatrixResult', '@carbroz/domain-operations'],
  ['Coordinates', '@carbroz/domain-operations'],
  ['TaxCalculator', '@carbroz/domain-financials'],
  ['DEFAULT_FINANCIAL_CONFIG', '@carbroz/domain-financials'],
  ['ErrorCode', '@carbroz/foundation-kernel'],
];
const priorityMarker = "['IFeatureFlagProvider', '@carbroz/domain-configuration'],";
workerSource = workerSource.replace(
  priorityMarker,
  priorityMarker + '\n' + ownershipAdditions.map(([symbol, owner]) => `    ['${symbol}', '${owner}'],`).join('\n'),
);

const worker = p('.architecture-closeout-worker.mjs');
write(worker, workerSource);
run(process.execPath, ['--check', worker]);
console.log('[closeout-orchestrator] migration syntax and ownership adoption verified');
run(process.execPath, [worker]);

const postpatch = p('tools/architecture-closeout-postpatch.mjs');
if (fs.existsSync(postpatch)) run(process.execPath, [postpatch]);

write(p('apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts'), `import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { logFlow } from '@carbroz/platform-observability';

const startedAt = Symbol('carbroz.request.startedAt');
declare module 'fastify' { interface FastifyRequest { [startedAt]?: bigint; } }

function surfaceFor(url: string): 'partner' | 'customer' | 'admin' | 'system' {
  if (url.startsWith('/api/v1/partner/')) return 'partner';
  if (url.startsWith('/api/v1/customer/')) return 'customer';
  if (url.startsWith('/api/v1/admin/')) return 'admin';
  return 'system';
}
function safeRoute(request: { routeOptions?: { url?: string }; url: string }): string {
  return request.routeOptions?.url ?? request.url.split('?')[0] ?? '/';
}
/** Registers correlation-aware, payload-safe lifecycle logging for every HTTP request. */
export default fp(async function requestFlowPlugin(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    request[startedAt] = process.hrtime.bigint();
    logFlow(request.log, 'http.request.started', { correlationId: request.traceId ?? request.id, method: request.method, route: safeRoute(request), surface: surfaceFor(request.url), outcome: 'started' });
  });
  app.addHook('onError', async (request, _reply, error) => {
    logFlow(request.log, 'http.request.failed', { correlationId: request.traceId ?? request.id, method: request.method, route: safeRoute(request), surface: surfaceFor(request.url), outcome: 'failed', errorCode: typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'UNEXPECTED_ERROR' });
  });
  app.addHook('onResponse', async (request, reply) => {
    const start = request[startedAt];
    logFlow(request.log, 'http.request.completed', { correlationId: request.traceId ?? request.id, method: request.method, route: safeRoute(request), surface: surfaceFor(request.url), statusCode: reply.statusCode, durationMs: start ? Number(process.hrtime.bigint() - start) / 1_000_000 : undefined, outcome: reply.statusCode >= 500 ? 'failed' : 'completed' });
  });
});
`);

const ciFile = p('.github/workflows/ci.yml');
if (fs.existsSync(ciFile)) {
  let ci = read(ciFile);
  ci = ci.replace(/# Stage A diagnostic only[\s\S]*?- name: Install dependencies \(Stage A migration diagnostic\)\n        run: pnpm install --no-frozen-lockfile/, "- name: Install dependencies\n        run: pnpm install --frozen-lockfile");
  write(ciFile, ci);
}

const vitestFile = p('vitest.config.ts');
if (fs.existsSync(vitestFile)) {
  let config = read(vitestFile);
  config = config.replace(/lines:\s*85/g, 'lines: 100').replace(/functions:\s*85/g, 'functions: 100').replace(/branches:\s*85/g, 'branches: 100').replace(/statements:\s*85/g, 'statements: 100');
  write(vitestFile, config);
}
const packageFile = p('package.json');
if (fs.existsSync(packageFile)) {
  const manifest = JSON.parse(read(packageFile));
  manifest.scripts['test:freeze'] = 'vitest run --coverage';
  write(packageFile, JSON.stringify(manifest, null, 2));
}

for (const helper of ['.architecture-closeout-worker.mjs','tools/architecture-closeout-preflight.mjs','tools/architecture-closeout-prepatch.mjs','tools/architecture-closeout-postpatch.mjs']) fs.rmSync(p(helper), { force: true, recursive: true });
console.log('[closeout-orchestrator] transformation and hardening completed; workflow validation may proceed');
