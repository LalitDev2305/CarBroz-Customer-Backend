import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = (x) => fs.existsSync(p(x));
const rel = (x) => path.relative(root, x).replaceAll('\\', '/');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(absolute));
    else out.push(absolute);
  }
  return out;
}

const requiredRoots = [
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
  'domains/audit',
  'domains/enterprise',
  'platform/database',
  'platform/cache',
  'platform/messaging',
  'platform/storage',
  'platform/observability',
  'platform/integrations',
  'sdui/registry',
  'sdui/ui-sdk',
  'tests',
  'docs',
];
for (const required of requiredRoots) {
  if (!exists(required)) throw new Error(`Canonical structure missing required root: ${required}`);
}

const forbiddenRoots = [
  'shared',
  'shared/kernel',
  'packages',
  'packages/common',
  'packages/config',
  'domains/catalog',
  'domains/pricing',
  'domains/payment',
  'domains/invoice',
  'domains/payout',
  'domains/tracking',
  'domains/notification',
  'domains/review',
  'domains/coupon',
  'domains/config',
  'domains/partner-profile',
  'domains/partner-kyc',
  'platform/event-bus',
  'platform/queue',
  'platform/notification',
  'platform/feature-flags',
  'platform/testing',
];
for (const forbidden of forbiddenRoots) {
  if (exists(forbidden)) throw new Error(`Legacy/duplicate root survives canonical migration: ${forbidden}`);
}

if (!exists('domains/customer/address/domain/Address.ts')) {
  throw new Error('Customer Address must have one canonical owner at domains/customer/address/domain/Address.ts');
}
if (exists('domains/customer/profile/domain/Address.ts')) {
  throw new Error('Duplicate Customer Address remains under profile');
}
if (exists('domains/customer/profile/domain/repositories/IAddressRepository.ts')) {
  throw new Error('Duplicate IAddressRepository remains under customer profile');
}

const generated = walk(root).filter((file) => rel(file).split('/').includes('dist') || file.endsWith('.tsbuildinfo'));
if (generated.length) {
  throw new Error(`Generated build output is present in canonical source tree:\n${generated.map(rel).join('\n')}`);
}

// Real implementation identity must be unique. Interfaces and type aliases may
// legitimately share imported names across files, so this gate intentionally
// inspects only actual top-level class/enum declarations. Anchoring at line start
// prevents `import type { Foo }` and nested type references from being mistaken
// for declarations.
const declarationOwners = new Map();
const duplicateDeclarations = [];
const sourceFiles = walk(root).filter((file) =>
  file.endsWith('.ts') &&
  !rel(file).includes('/dist/') &&
  !rel(file).includes('/node_modules/') &&
  !file.endsWith('.d.ts')
);
const declarationPattern = /^\s*(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:class|enum)\s+([A-Za-z_$][\w$]*)\b/gm;
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(declarationPattern)) {
    const name = match[1];
    const owner = declarationOwners.get(name);
    if (owner && owner !== rel(file)) duplicateDeclarations.push(`${name}: ${owner} <> ${rel(file)}`);
    else declarationOwners.set(name, rel(file));
  }
}
if (duplicateDeclarations.length) {
  throw new Error(`Duplicate class/enum implementations detected:\n${duplicateDeclarations.sort().join('\n')}`);
}

for (const file of walk(p('apps/api/src')).filter((x) => x.endsWith('.ts'))) {
  if (/UseCase\.ts$/.test(file)) throw new Error(`Business use case remains under API composition: ${rel(file)}`);
}
for (const file of walk(p('platform/database')).filter((x) => x.endsWith('.ts'))) {
  if (/Prisma(?!RepositoryBase)[A-Za-z]+Repository\.ts$/.test(path.basename(file))) {
    throw new Error(`Business repository remains under platform/database: ${rel(file)}`);
  }
}

console.log('Backend V3 canonical structure verified: required roots, single kernel ownership, no legacy roots, no generated output, no duplicate class/enum implementations, and clean API/platform business boundaries.');
