import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const core = path.join(root, 'tools/architecture-closeout-quality-core.mjs');

if (!fs.existsSync(core)) throw new Error('Final architecture quality core helper is missing');

let source = fs.readFileSync(core, 'utf8');
const replacements = [
  ["const needsPublicId = !/\\bfindByPublicId\\s*:/.test(source);", "const needsPublicId = !/\\b(?:async\\s+)?findByPublicId\\s*(?::|\\()/.test(source);"],
  ["const needsBookingId = !/\\bfindByBookingId\\s*:/.test(source);", "const needsBookingId = !/\\b(?:async\\s+)?findByBookingId\\s*(?::|\\()/.test(source);"],
  ["if (!/\\bfindByPublicId\\s*:/.test(source) || !/\\bfindByBookingId\\s*:/.test(source)) {", "if (!/\\b(?:async\\s+)?findByPublicId\\s*(?::|\\()/.test(source) || !/\\b(?:async\\s+)?findByBookingId\\s*(?::|\\()/.test(source)) {"],
];
for (const [before, after] of replacements) {
  if (!source.includes(before)) throw new Error(`Unable to locate tracking fixture convergence marker: ${before}`);
  source = source.replace(before, after);
}
fs.writeFileSync(core, source);
console.log('[architecture-closeout-quality] tracking repository fixture detector accepts property and method syntax');

function canonicalizeTrackingRepositoryImports() {
  const repository = path.join(root, 'domains/operations/tracking/infrastructure/repositories/PrismaTrackingSessionRepository.ts');
  if (!fs.existsSync(repository)) return;
  const body = fs.readFileSync(repository, 'utf8')
    .split(/\r?\n/)
    .filter((line) => !/^import\b/.test(line.trim()) || !/\b(?:ITrackingSessionRepository|TrackingSession|TrackingStatus)\b/.test(line))
    .join('\n')
    .replace(/^\s+/, '');
  const canonicalInterfaceImport = "import type { ITrackingSessionRepository } from '../../domain/ITrackingSessionRepository.js';";
  const header = [canonicalInterfaceImport, "import { TrackingSession } from '../../domain/TrackingSession.js';", "import type { TrackingStatus } from '../../domain/TrackingStatus.js';", ''].join('\n');
  fs.writeFileSync(repository, `${header}${body.endsWith('\n') ? body : `${body}\n`}`);
  const finalSource = fs.readFileSync(repository, 'utf8');
  const interfaceImports = finalSource.split(/\r?\n/).filter((line) => /^import\b/.test(line.trim()) && /\bITrackingSessionRepository\b/.test(line));
  if (interfaceImports.length !== 1 || interfaceImports[0] !== canonicalInterfaceImport) throw new Error(`Tracking repository interface import is not canonical: ${interfaceImports.join(' | ')}`);
  if (!/implements\s+ITrackingSessionRepository\b/.test(finalSource)) throw new Error('PrismaTrackingSessionRepository no longer implements the canonical tracking repository port');
  if (/@carbroz\/common/.test(finalSource)) throw new Error('PrismaTrackingSessionRepository retains transitional @carbroz/common ownership');
}

function normalizePublicBoundary(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) return;
  const cleaned = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    .filter((line) => !line.includes('/infrastructure/') && !line.includes('@prisma/client'))
    .join('\n').replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(file, cleaned.endsWith('\n') ? cleaned : `${cleaned}\n`);
  const finalSource = fs.readFileSync(file, 'utf8');
  if (finalSource.includes('/infrastructure/') || finalSource.includes('@prisma/client')) throw new Error(`${relativePath} still leaks concrete infrastructure`);
}

function normalizeAllCanonicalPublicBoundaries() {
  for (const relative of [
    'domains/identity/public/index.ts', 'domains/partner/public/index.ts', 'domains/customer/public/index.ts',
    'domains/catalog-pricing/public/index.ts', 'domains/booking/public/index.ts', 'domains/operations/public/index.ts',
    'domains/financials/public/index.ts', 'domains/communications/public/index.ts', 'domains/engagement/public/index.ts',
    'domains/configuration/public/index.ts', 'domains/dispute/public/index.ts', 'domains/enterprise/public/index.ts',
    'domains/audit/public/index.ts', 'sdui/registry/public/index.ts',
  ]) normalizePublicBoundary(relative);
}

function normalizeCorporateMoneyFixture() {
  const file = path.join(root, 'tests/integration/domain/corporate.test.ts');
  if (!fs.existsSync(file)) return;
  let body = fs.readFileSync(file, 'utf8');
  body = body.replace(/import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"];?/g, (full, names, moduleName) => {
    if (moduleName === '@carbroz/foundation-kernel') return full;
    const kept = names.split(',').map((name) => name.trim()).filter((name) => name && name !== 'Money');
    return kept.length ? `import { ${kept.join(', ')} } from '${moduleName}';` : '';
  });
  body = body.replace(/import\s+\{[^}]*\bMoney\b[^}]*\}\s+from\s+['"]@carbroz\/foundation-kernel['"];?\r?\n?/g, '');
  body = `import { Money } from '@carbroz/foundation-kernel';\n${body.replace(/^\s+/, '')}`;
  fs.writeFileSync(file, body.endsWith('\n') ? body : `${body}\n`);
  const finalSource = fs.readFileSync(file, 'utf8');
  const moneyImports = finalSource.match(/import\s+\{[^}]*\bMoney\b[^}]*\}\s+from\s+['"]@carbroz\/foundation-kernel['"]/g) ?? [];
  if (moneyImports.length !== 1) throw new Error(`Corporate fixture must have exactly one Foundation Money import; found ${moneyImports.length}`);
}

function normalizeTrackingFixtureRuntimePort() {
  const file = path.join(root, 'tests/integration/application/tracking-notification-engine.test.ts');
  if (!fs.existsSync(file)) return;
  let body = fs.readFileSync(file, 'utf8');
  const constructorPattern = /new\s+StartTrackingSessionUseCase\(\s*([A-Za-z_$][\w$]*)\s*,/g;
  let replacementsCount = 0;
  body = body.replace(constructorPattern, (_full, repositoryVariable) => {
    replacementsCount += 1;
    return `new StartTrackingSessionUseCase(Object.assign(${repositoryVariable}, { findByBookingId: async (_bookingId: number) => null }),`;
  });
  if (replacementsCount === 0) {
    const diagnostic = body.split(/\r?\n/).filter((line) => /StartTrackingSessionUseCase|mockTracking|trackingRepo/i.test(line)).slice(0, 40).join(' | ');
    throw new Error(`Unable to scope tracking runtime repository passed to StartTrackingSessionUseCase: ${diagnostic}`);
  }
  fs.writeFileSync(file, body.endsWith('\n') ? body : `${body}\n`);
  const finalSource = fs.readFileSync(file, 'utf8');
  const assigned = finalSource.match(/new\s+StartTrackingSessionUseCase\(Object\.assign\([^,]+,\s*\{\s*findByBookingId:/g) ?? [];
  if (assigned.length !== replacementsCount) throw new Error(`Tracking runtime port assignment verification failed: ${assigned.length}/${replacementsCount}`);
}

try {
  await import('./architecture-closeout-quality-core.mjs');
  canonicalizeTrackingRepositoryImports();
  normalizeAllCanonicalPublicBoundaries();
  normalizeCorporateMoneyFixture();
  normalizeTrackingFixtureRuntimePort();
  console.log('[architecture-closeout-quality] canonical public boundaries, corporate Money authority and actual tracking constructor repositories converged');
} finally {
  fs.rmSync(core, { force: true });
}
