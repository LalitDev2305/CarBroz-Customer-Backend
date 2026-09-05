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

function normalizeRootTestHarness() {
  const packageFile = path.join(root, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  manifest.devDependencies ??= {};
  for (const packageName of [
    '@carbroz/domain-audit', '@carbroz/domain-booking', '@carbroz/domain-catalog-pricing',
    '@carbroz/domain-communications', '@carbroz/domain-configuration', '@carbroz/domain-customer',
    '@carbroz/domain-dispute', '@carbroz/domain-engagement', '@carbroz/domain-enterprise',
    '@carbroz/domain-financials', '@carbroz/domain-identity', '@carbroz/domain-operations',
    '@carbroz/domain-partner', '@carbroz/foundation-kernel', '@carbroz/sdui-registry', '@carbroz/ui-sdk',
  ]) manifest.devDependencies[packageName] = 'workspace:*';
  write(packageFile, `${JSON.stringify(manifest, null, 2)}\n`);

  const commonRewrites = new Map([
    ['tests/integration/domain/audit.test.ts', "@carbroz/domain-audit"],
    ['tests/integration/domain/corporate.test.ts', "@carbroz/domain-enterprise"],
    ['tests/integration/domain/coupon.test.ts', "@carbroz/domain-engagement"],
    ['tests/integration/domain/notification.test.ts', "@carbroz/domain-communications"],
    ['tests/integration/domain/review.test.ts', "@carbroz/domain-engagement"],
    ['tests/integration/domain/tracking.test.ts', "@carbroz/domain-operations"],
  ]);

  for (const [relative, target] of commonRewrites) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replaceAll("../../../packages/common/src/index.js", target);
    content = content.replaceAll("../../../packages/common/src/index.ts", target);
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
  if (legacyImports.length) {
    throw new Error(`Legacy Common imports remain in final integration tests:\n${legacyImports.map((file) => path.relative(root, file)).join('\n')}`);
  }

  console.log('[architecture-closeout-finalize] root test harness consumes canonical workspace contracts only');
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
      expect(source, entry).not.toMatch(/\/infrastructure\//);
      expect(source, entry).not.toContain('@prisma/client');
    }
  });

  it('keeps universal Money and ExecutionContext authority in Foundation', () => {
    const money = fs.readFileSync(path.join(root, 'foundation/kernel/src/domain/Money.ts'), 'utf8');
    const contracts = fs.readFileSync(path.join(root, 'foundation/kernel/src/application/contracts.ts'), 'utf8');
    expect(money).toContain('class Money');
    expect(money).toContain('amountMinor');
    expect(contracts).toContain('interface ExecutionContext');
    expect(contracts).toContain('actor: ActorContext');
  });
});
`);

  write(path.join(root, 'tests/e2e/api-health.e2e.test.ts'), `import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../apps/api/src/bootstrap/app.js';

let app: Awaited<ReturnType<typeof buildApp>> | undefined;
afterEach(async () => {
  if (app) await app.close();
  app = undefined;
});

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

function normalizeRootReadme() {
  const file = path.join(root, 'README.md');
  if (!fs.existsSync(file)) throw new Error('Root README is missing after closeout');
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/^# CarBroz Backend[^\n]*/m, '# CarBroz Backend V3 — Constitution-Frozen Architecture');
  if (!content.includes('Template -> Component -> Element')) {
    content += `\n## Canonical SDUI composition\n\nThe minimum structural composition is **Template -> Component -> Element**. Optional Section and Group levels may be inserted only where the canonical UI SDK schema allows them; structural mechanics remain owned by \`sdui/ui-sdk\`, while lifecycle/versioning remains owned by \`sdui/registry\`.\n`;
  }
  if (!content.includes('pnpm test:freeze')) {
    content += `\n## Final validation gate\n\nBefore merge or architecture freeze run \`pnpm install --frozen-lockfile\`, Prisma validation/generation, \`pnpm -r build\`, \`pnpm lint\`, \`pnpm test -- --run\`, and finally \`pnpm test:freeze\`. No failing architecture, contract, integration, E2E, or coverage gate may be waived.\n`;
  }
  write(file, content);
  console.log('[architecture-closeout-finalize] root README normalized to Backend V3 and final validation workflow');
}

// Final topology accepts only the canonical workspace roots. Transitional packages/ must be gone.
if (fs.existsSync(path.join(root, 'packages'))) {
  throw new Error('Transitional top-level packages/ still exists after closeout');
}
const workspaceFile = path.join(root, 'pnpm-workspace.yaml');
const workspace = fs.existsSync(workspaceFile) ? fs.readFileSync(workspaceFile, 'utf8') : '';
const requiredWorkspaceRoots = ['apps/*', 'domains/*', 'sdui/*', 'platform/*', 'foundation/*'];
for (const workspaceRoot of requiredWorkspaceRoots) {
  if (!workspace.includes(`"${workspaceRoot}"`) && !workspace.includes(`'${workspaceRoot}'`) && !workspace.includes(`- ${workspaceRoot}`)) {
    throw new Error(`Canonical workspace root missing after closeout: ${workspaceRoot}`);
  }
}
if (/packages\/\*/.test(workspace)) throw new Error('pnpm workspace still includes transitional packages/*');

// The final architecture policies are generated during the atomic transform. Parse/lint them now so
// generator escaping defects fail before expensive Prisma/build validation. Use the already-installed
// binary directly: invoking pnpm here would re-resolve the intentionally transformed workspace before
// the workflow reaches its dedicated post-transform reinstall step.
const architecturePolicies = [
  'tests/architecture/canonical-topology.policy.test.ts',
  'tests/architecture/engineering-quality.policy.test.ts',
];
for (const policy of architecturePolicies) {
  if (!fs.existsSync(path.join(root, policy))) throw new Error(`Generated architecture policy missing: ${policy}`);
}
const eslintBinary = path.join(root, 'node_modules/.bin/eslint');
if (!fs.existsSync(eslintBinary)) throw new Error('Installed ESLint binary is unavailable for generated-policy validation');
execFileSync(eslintBinary, architecturePolicies, { cwd: root, stdio: 'inherit' });
console.log('[architecture-closeout-finalize] emitted architecture policies parse and lint successfully');

// The frozen API topology is transport/composition only. These legacy directories are evidence
// that apps/api is still acting as a second application/infrastructure ownership layer.
const legacyApiRoots = ['modules', 'container', 'providers'];
const legacyResidue = legacyApiRoots.filter((name) => fs.existsSync(path.join(apiSource, name)));
if (legacyResidue.length) {
  throw new Error(`Legacy API ownership roots remain after closeout: ${legacyResidue.join(', ')}`);
}

// Admin and Customer may validate similar payloads, but their transport contracts are
// independently versioned. Duplicate the transport schema instead of importing another surface.
for (const name of ['review.dto.ts', 'coupon.dto.ts']) {
  const source = path.join(surfaces, 'customer/dto', name);
  const target = path.join(surfaces, 'admin/dto', name);
  if (fs.existsSync(source) && !fs.existsSync(target)) write(target, fs.readFileSync(source, 'utf8'));
}

for (const file of walk(path.join(surfaces, 'admin'))) {
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replaceAll('../../customer/dto/review.dto.js', '../dto/review.dto.js')
    .replaceAll('../../customer/dto/coupon.dto.js', '../dto/coupon.dto.js');
  write(file, content);
}

const violations = [];
const names = ['partner', 'customer', 'admin'];
for (const owner of names) {
  for (const file of walk(path.join(surfaces, owner))) {
    const content = fs.readFileSync(file, 'utf8');
    for (const other of names) {
      if (other === owner) continue;
      const marker = new RegExp(`from\\s+['"][^'"]*(?:\\.\\./)+${other}/`);
      if (marker.test(content)) violations.push(`${path.relative(root, file)} imports ${other} surface internals`);
    }
  }
}

if (violations.length) {
  throw new Error(`Product surface isolation failed:\n${violations.map((v) => `- ${v}`).join('\n')}`);
}

normalizeRootTestHarness();
ensureFinalTestLayers();
normalizeRootReadme();

console.log('[architecture-closeout-finalize] canonical workspace, transport-only API topology, product surface isolation, final tests and README are frozen');
