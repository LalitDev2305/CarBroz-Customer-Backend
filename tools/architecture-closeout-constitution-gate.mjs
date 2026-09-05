import fs from 'node:fs';
import path from 'node:path';

await import('./architecture-closeout-hardening.mjs');

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

for (const directory of [
  'apps/api',
  'foundation/kernel',
  'domains/identity',
  'domains/customer',
  'domains/partner',
  'domains/catalog-pricing',
  'domains/booking',
  'domains/financials',
  'domains/operations',
  'domains/communications',
  'domains/engagement',
  'domains/configuration',
  'domains/dispute',
  'domains/enterprise',
  'domains/audit',
  'sdui/ui-sdk',
  'sdui/registry',
  'platform/database',
  'platform/cache',
  'platform/messaging',
  'platform/storage',
  'platform/observability',
  'platform/integrations',
]) required(directory, 'canonical constitution owner is missing');

for (const directory of [
  'packages',
  'apps/api/src/modules',
  'apps/api/src/container',
  'apps/api/src/providers',
  'apps/api/src/infra/repositories',
  'domains/catalog-pricing/app2',
  'domains/partner/app2',
  'domains/partner-core',
]) forbidden(directory, 'legacy/transitional authority survived closeout');

const workspaceFile = path.join(root, 'pnpm-workspace.yaml');
required('pnpm-workspace.yaml', 'workspace definition is required');
if (fs.existsSync(workspaceFile)) {
  const workspace = fs.readFileSync(workspaceFile, 'utf8');
  for (const canonicalRoot of ['apps/*', 'domains/*', 'sdui/*', 'platform/*', 'foundation/*']) {
    if (!workspace.includes(canonicalRoot)) violations.push(`pnpm-workspace.yaml: missing canonical root ${canonicalRoot}`);
  }
  if (/packages\/\*/.test(workspace)) violations.push('pnpm-workspace.yaml: transitional packages/* workspace survived');
}

for (const document of [
  'README.md',
  'docs/MASTER-BACKEND-CONSTITUTION.md',
  'docs/ENGINEERING-DOCUMENTATION-STANDARD.md',
  'docs/FORENSIC-CHANGE-GATE.md',
  'docs/TESTING-EXTENSIBILITY-AND-PROVIDER-STANDARD.md',
]) required(document, 'governing architecture documentation is missing');

for (const packageFile of walk(root).filter((file) => path.basename(file) === 'package.json')) {
  if (relative(packageFile).startsWith('node_modules/')) continue;
  const packageRoot = path.dirname(packageFile);
  const relRoot = relative(packageRoot);
  if (relRoot === '.') continue;
  if (!fs.existsSync(path.join(packageRoot, 'README.md'))) {
    violations.push(`${relRoot}/README.md: package/module architecture documentation is missing`);
  }
}

for (const evidence of [
  'tests/architecture/canonical-topology.policy.test.ts',
  'tests/architecture/engineering-quality.policy.test.ts',
  'tests/contracts/canonical-public-contracts.contract.test.ts',
  'tests/e2e/api-health.e2e.test.ts',
  'tests/integration',
]) required(evidence, 'required positive/negative/regression evidence layer is missing');

const productionRoots = ['apps', 'domains', 'sdui', 'platform', 'foundation'];
const allProduction = productionRoots.flatMap(sourceFiles);
const legacyPatterns = [
  ['@carbroz/common', 'legacy Common package import'],
  ['packages/common', 'legacy Common source-path import'],
  ['ActorIdentity', 'superseded actor contract'],
  ['IRequestContext', 'transport request context leaked across application boundary'],
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

for (const file of sourceFiles('foundation')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/from\s+['"]@carbroz\/(?:domain-|platform-|api|ui-sdk|sdui)/.test(content) || /from\s+['"][^'"]*(?:apps|domains|platform|sdui)\//.test(content)) {
    violations.push(`${relative(file)}: Foundation depends upward`);
  }
}
for (const file of sourceFiles('domains')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/from\s+['"][^'"]*apps\/api|from\s+['"]@carbroz\/api/.test(content)) {
    violations.push(`${relative(file)}: domain imports API transport`);
  }
  if (/from\s+['"]@carbroz\/platform-|from\s+['"][^'"]*platform\//.test(content)) {
    violations.push(`${relative(file)}: domain imports a platform implementation`);
  }
  if (/from\s+['"](?:razorpay|twilio|firebase-admin|@aws-sdk\/|minio|bullmq)/i.test(content)) {
    violations.push(`${relative(file)}: vendor SDK type/implementation leaked into domain`);
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
  if (content.includes('/infrastructure/') || content.includes('@prisma/client')) {
    violations.push(`${relative(file)}: public boundary exposes concrete infrastructure`);
  }
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

if (violations.length) {
  console.error('[constitution-gate] FINAL CONSTITUTION CLOSEOUT FAILED');
  for (const violation of [...new Set(violations)].sort()) console.error(`- ${violation}`);
  process.exit(1);
}

// The second invocation occurs after executable tests/coverage and is the last pre-cleanup proof.
// Remove generated diagnostics and the temporary hardening helper so neither can enter the frozen source commit.
if (fs.existsSync(path.join(root, 'closeout-test-output.txt'))) {
  fs.rmSync(path.join(root, 'closeout-test-output.txt'), { force: true });
  fs.rmSync(path.join(root, 'coverage'), { recursive: true, force: true });
  fs.rmSync(path.join(root, 'tools/architecture-closeout-hardening.mjs'), { force: true });
}

console.log('[constitution-gate] canonical topology, ownership, dependency direction, documentation, tests, providers and observability verified');
