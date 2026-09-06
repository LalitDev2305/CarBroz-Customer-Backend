import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Execute deterministic convergence producers before evaluating the final candidate tree.
await import('./architecture-closeout-hardening.mjs');
await import('./architecture-closeout-runtime-regression.mjs');
await import('./architecture-closeout-coverage-tests.mjs');

const root = process.cwd();
const violations = [];
const required = (relative, reason) => {
  if (!fs.existsSync(path.join(root, relative))) violations.push(`${relative}: ${reason}`);
};
const forbidden = (relative, reason) => {
  if (fs.existsSync(path.join(root, relative))) violations.push(`${relative}: ${reason}`);
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'generated', '.git', 'coverage'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}
function sourceFiles(base) {
  return walk(path.join(root, base)).filter((file) => /\.(?:ts|mts|cts)$/.test(file));
}
function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}
function imports(content) {
  return [...content.matchAll(/(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

// Constitution §§5–7: exact canonical source authorities.
for (const directory of [
  'apps/api', 'foundation/kernel',
  'domains/identity', 'domains/customer', 'domains/partner', 'domains/catalog-pricing', 'domains/booking',
  'domains/financials', 'domains/operations', 'domains/communications', 'domains/engagement',
  'domains/configuration', 'domains/dispute', 'domains/enterprise', 'domains/audit',
  'sdui/ui-sdk', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage',
  'platform/observability', 'platform/integrations',
]) required(directory, 'canonical Constitution owner is missing');
for (const directory of [
  'packages', 'shared', 'libs', 'common',
  'apps/api/src/modules', 'apps/api/src/container', 'apps/api/src/providers', 'apps/api/src/infra/repositories',
  'apps/api/src/config', 'apps/api/src/context', 'apps/api/src/controllers', 'apps/api/src/middlewares', 'apps/api/src/plugins',
  'domains/catalog-pricing/app2', 'domains/partner/app2', 'domains/partner-core',
]) forbidden(directory, 'legacy/transitional authority survived closeout');
for (const file of ['apps/api/src/app.ts', 'apps/api/src/server.ts', 'apps/api/src/app.routes.ts']) {
  forbidden(file, 'API bootstrap/route entry point must live under the canonical bootstrap/surface structure');
}

const workspaceFile = path.join(root, 'pnpm-workspace.yaml');
required('pnpm-workspace.yaml', 'workspace definition is required');
if (fs.existsSync(workspaceFile)) {
  const workspace = fs.readFileSync(workspaceFile, 'utf8');
  const canonicalRoots = ['apps/*', 'domains/*', 'sdui/*', 'platform/*', 'foundation/*'];
  const declaredRoots = [...workspace.matchAll(/^\s*-\s*["']?([^"'\s]+)["']?\s*$/gm)].map((match) => match[1]);
  for (const canonicalRoot of canonicalRoots) {
    if (!declaredRoots.includes(canonicalRoot)) violations.push(`pnpm-workspace.yaml: missing canonical root ${canonicalRoot}`);
  }
  for (const declaredRoot of declaredRoots) {
    if (!canonicalRoots.includes(declaredRoot)) violations.push(`pnpm-workspace.yaml: noncanonical workspace root ${declaredRoot}`);
  }
  if (declaredRoots.length !== canonicalRoots.length) {
    violations.push(`pnpm-workspace.yaml: workspace roots must be exactly ${canonicalRoots.join(', ')}`);
  }
}

// Constitution §§8–9: API is composition/transport only and surfaces are physically isolated.
for (const directory of [
  'apps/api/src/bootstrap',
  'apps/api/src/surfaces/partner',
  'apps/api/src/surfaces/customer',
  'apps/api/src/surfaces/admin',
  'apps/api/src/transport',
  'apps/api/src/system',
]) required(directory, 'canonical API structure is incomplete');
for (const file of ['apps/api/src/bootstrap/app.ts', 'apps/api/src/bootstrap/server.ts']) {
  required(file, 'canonical API bootstrap entry point is missing');
}

const surfaceRules = [
  ['apps/api/src/surfaces/partner', /(?:surfaces\/customer|surfaces\/admin)/, 'Partner surface imports another surface internals'],
  ['apps/api/src/surfaces/customer', /(?:surfaces\/partner|surfaces\/admin)/, 'Customer surface imports another surface internals'],
  ['apps/api/src/surfaces/admin', /(?:surfaces\/partner|surfaces\/customer)/, 'Admin surface imports Partner/Customer transport internals'],
];
for (const [base, pattern, reason] of surfaceRules) {
  for (const file of sourceFiles(base)) {
    for (const specifier of imports(fs.readFileSync(file, 'utf8'))) {
      if (pattern.test(specifier)) violations.push(`${relative(file)}: ${reason} (${specifier})`);
    }
  }
}

for (const document of [
  'README.md', 'docs/MASTER-BACKEND-CONSTITUTION.md', 'docs/ENGINEERING-DOCUMENTATION-STANDARD.md',
  'docs/FORENSIC-CHANGE-GATE.md', 'docs/TESTING-EXTENSIBILITY-AND-PROVIDER-STANDARD.md',
  'docs/CONSTITUTION-COMPLIANCE-MATRIX.md',
]) required(document, 'governing architecture documentation is missing');
for (const packageFile of walk(root).filter((file) => path.basename(file) === 'package.json')) {
  if (relative(packageFile).startsWith('node_modules/')) continue;
  const packageRoot = path.dirname(packageFile);
  const relRoot = relative(packageRoot);
  if (relRoot !== '.' && !fs.existsSync(path.join(packageRoot, 'README.md'))) {
    violations.push(`${relRoot}/README.md: package/module architecture documentation is missing`);
  }
}

for (const evidence of [
  'tests/architecture/canonical-topology.policy.test.ts', 'tests/architecture/engineering-quality.policy.test.ts',
  'tests/architecture/production-coverage-scope.policy.test.ts', 'tests/architecture/support/production-coverage-scope.mjs',
  'tests/contracts/canonical-public-contracts.contract.test.ts', 'tests/e2e/api-health.e2e.test.ts', 'tests/integration',
  'tests/unit/foundation-kernel.behavior.test.ts', 'tests/unit/observability.behavior.test.ts',
  'tests/unit/sdui-registry-domain.behavior.test.ts', 'sdui/registry/tests/PrismaSduiRegistryRepository.spec.ts',
  'sdui/ui-sdk/tests/screen-serializer.test.ts',
]) required(evidence, 'required positive/negative/regression evidence layer is missing');

const vitestConfigFile = path.join(root, 'vitest.config.ts');
required('vitest.config.ts', 'production test/coverage configuration is missing');
if (fs.existsSync(vitestConfigFile)) {
  const config = fs.readFileSync(vitestConfigFile, 'utf8');
  for (const marker of ['findExecutableProductionFiles', 'coverage:', 'include: executableProductionFiles']) {
    if (!config.includes(marker)) violations.push(`vitest.config.ts: missing Constitution §49 coverage scope marker ${marker}`);
  }
  for (const threshold of ['lines: 100', 'functions: 100', 'branches: 100', 'statements: 100']) {
    if (!config.includes(threshold)) violations.push(`vitest.config.ts: final freeze threshold missing ${threshold}`);
  }
}

const coverageScopeFile = path.join(root, 'tests/architecture/support/production-coverage-scope.mjs');
if (fs.existsSync(coverageScopeFile)) {
  const scope = fs.readFileSync(coverageScopeFile, 'utf8');
  for (const marker of ['PRODUCTION_ROOTS', 'sourceTextIsExecutable', 'findExecutableProductionFiles', 'findStructuralProductionFiles']) {
    if (!scope.includes(marker)) violations.push(`tests/architecture/support/production-coverage-scope.mjs: missing deterministic coverage marker ${marker}`);
  }
}

const productionRoots = ['apps', 'domains', 'sdui', 'platform', 'foundation'];
const allProduction = productionRoots.flatMap(sourceFiles);
const legacyPatterns = [
  ['@carbroz/common', 'legacy Common package import'], ['packages/common', 'legacy Common source-path import'],
  ['ActorIdentity', 'superseded actor contract'], ['IRequestContext', 'transport request context leaked across application boundary'],
];
for (const file of allProduction) {
  const content = fs.readFileSync(file, 'utf8');
  for (const [needle, reason] of legacyPatterns) {
    if (content.includes(needle)) violations.push(`${relative(file)}: ${reason} (${needle})`);
  }
  if (/\bconsole\.(?:log|debug|info|warn|error)\s*\(/.test(content)) {
    violations.push(`${relative(file)}: direct console logging bypasses canonical observability`);
  }
}

// Constitution §§33–36: inward dependencies and public context boundaries.
for (const file of sourceFiles('foundation')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/from\s+['"]@carbroz\/(?:domain-|platform-|api|ui-sdk|sdui)/.test(content) || /from\s+['"][^'"]*(?:apps|domains|platform|sdui)\//.test(content)) {
    violations.push(`${relative(file)}: Foundation depends upward`);
  }
}
for (const file of sourceFiles('domains')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/from\s+['"][^'"]*apps\/api|from\s+['"]@carbroz\/api/.test(content)) violations.push(`${relative(file)}: domain imports API transport`);
  if (/from\s+['"]@carbroz\/platform-|from\s+['"][^'"]*platform\//.test(content)) violations.push(`${relative(file)}: domain imports a platform implementation`);
  if (/from\s+['"](?:razorpay|twilio|firebase-admin|@aws-sdk\/|minio|bullmq)/i.test(content)) violations.push(`${relative(file)}: vendor SDK leaked into domain`);

  const ownerMatch = relative(file).match(/^domains\/([^/]+)\//);
  const owner = ownerMatch?.[1];
  for (const specifier of imports(content)) {
    const target = specifier.match(/^@carbroz\/domain-([^/]+)(\/.*)?$/);
    if (target && target[1] !== owner && target[2] && !/^\/public(?:\/|$)/.test(target[2])) {
      violations.push(`${relative(file)}: forbidden deep cross-domain import ${specifier}; consume the target public boundary`);
    }
  }
}
for (const file of sourceFiles('apps/api')) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('@prisma/client')) violations.push(`${relative(file)}: API transport imports Prisma directly`);
  if (/\/use-cases\//.test(relative(file)) || /\/domain\//.test(relative(file)) || /\/repositories\//.test(relative(file))) {
    violations.push(`${relative(file)}: business/persistence authority remains under API transport`);
  }
}
for (const file of walk(path.join(root, 'domains')).filter((candidate) => candidate.endsWith('/public/index.ts'))) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('/infrastructure/') || content.includes('@prisma/client')) violations.push(`${relative(file)}: public boundary exposes concrete infrastructure`);
}

// Constitution §§14–16/21: explicit bounded-context ownership that cannot be inferred from generic dependency scans.
for (const file of sourceFiles('domains/enterprise')) {
  const rel = relative(file);
  if (/(?:^|\/)(?:Corporate)?(?:Invoice|Payment|Settlement|Ledger)(?:[A-Z./-]|$)/.test(rel) || /ReconcileCorporatePayment|GenerateCorporateInvoice/.test(rel)) {
    violations.push(`${rel}: Enterprise owns corporate identity/fleet/eligibility; invoice/payment accounting belongs to Financials`);
  }
}
for (const file of sourceFiles('domains/booking')) {
  const rel = relative(file);
  if (/(?:dispatch|tracking|slot-inventory|capacity|partner-assignment)/i.test(rel)) {
    violations.push(`${rel}: Booking must not own Operations capacity/assignment/dispatch/tracking authority`);
  }
}

// Constitution §§24–32: one generic SDUI language, no legacy hierarchy or product coupling.
const legacySdui = /\b(?:Subcomponent|ChildrenData|subComponents|childrenData|addSubcomponent|addChildData)\b/;
for (const file of sourceFiles('sdui')) {
  const content = fs.readFileSync(file, 'utf8');
  if (legacySdui.test(content)) violations.push(`${relative(file)}: legacy SDUI structural vocabulary survived`);
}
for (const file of sourceFiles('sdui/ui-sdk')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/(?:@carbroz\/domain-(?:partner|customer)|domains\/(?:partner|customer)\/)/.test(content)) {
    violations.push(`${relative(file)}: generic SDUI depends on Partner/Customer business ownership`);
  }
}

// Constitution §41: freeze must be impossible while development/mock authentication remains production behavior.
for (const file of sourceFiles('domains/identity')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/\bmockOtp\b/.test(content)) violations.push(`${relative(file)}: production Identity exposes mock OTP behavior`);
  if (/otp\s*!==\s*['"](?:123456|111111)['"]|otp\s*===\s*['"](?:123456|111111)['"]/.test(content)) {
    violations.push(`${relative(file)}: hardcoded development OTP accepted in production Identity`);
  }
  if (/Buffer\.from\([^\n]*Date\.now\(\)/.test(content)) violations.push(`${relative(file)}: refresh/session token material is timestamp-derived rather than cryptographically strong`);
}

required('apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts', 'correlation-aware request lifecycle logging is missing');
required('platform/observability/src/ports/ILoggerProvider.ts', 'canonical logger provider contract is missing');
const requestFlow = path.join(root, 'apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts');
if (fs.existsSync(requestFlow)) {
  const content = fs.readFileSync(requestFlow, 'utf8');
  for (const marker of ['http.request.started', 'http.request.failed', 'http.request.completed', 'correlationId']) {
    if (!content.includes(marker)) violations.push(`apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts: missing ${marker} evidence`);
  }
}
const contextFile = path.join(root, 'foundation/kernel/src/application/contracts.ts');
required('foundation/kernel/src/application/contracts.ts', 'canonical application contracts are missing');
if (fs.existsSync(contextFile)) {
  const content = fs.readFileSync(contextFile, 'utf8');
  for (const marker of ['interface ActorContext', 'interface ExecutionContext', 'actor: ActorContext', 'id: number']) {
    if (!content.includes(marker)) violations.push(`foundation/kernel/src/application/contracts.ts: missing ${marker}`);
  }
  if (content.includes('actor?:')) violations.push('foundation/kernel/src/application/contracts.ts: actor is still optional');
}
const providerPorts = sourceFiles('domains').filter((file) => /\/ports\/I[^/]*Provider\.ts$/.test(relative(file)));
if (providerPorts.length === 0) violations.push('domains/**/ports/I*Provider.ts: no semantic provider ports found');
required('platform/integrations', 'replaceable external provider adapter boundary is missing');

// Constitution §52: tracked build/coverage output is never source. Untracked build output is allowed during validation.
try {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  for (const file of tracked) {
    if (/(^|\/)(?:dist|coverage|generated)\//.test(file) || /\.tsbuildinfo$/.test(file)) {
      violations.push(`${file}: tracked generated/build output violates Constitution §52`);
    }
  }
} catch (error) {
  violations.push(`git tracked-output verification failed: ${error instanceof Error ? error.message : String(error)}`);
}

if (violations.length) {
  console.error('[constitution-gate] FINAL CONSTITUTION CLOSEOUT FAILED');
  for (const violation of [...new Set(violations)].sort()) console.error(`- ${violation}`);
  process.exit(1);
}

// The second invocation occurs after executable tests/coverage and is the last pre-cleanup proof.
if (fs.existsSync(path.join(root, 'closeout-test-output.txt'))) {
  fs.rmSync(path.join(root, 'closeout-test-output.txt'), { force: true });
  fs.rmSync(path.join(root, 'coverage'), { recursive: true, force: true });
  fs.rmSync(path.join(root, 'tools/architecture-closeout-hardening.mjs'), { force: true });
  fs.rmSync(path.join(root, 'tools/architecture-closeout-runtime-regression.mjs'), { force: true });
  fs.rmSync(path.join(root, 'tools/architecture-closeout-coverage-tests.mjs'), { force: true });
}
console.log('[constitution-gate] literal topology, ownership, isolation, dependency, SDUI, auth-security, generated-output and coverage-scope Constitution rules verified');
