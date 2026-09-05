import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const core = path.join(root, 'tools/architecture-closeout-quality-core.mjs');

if (!fs.existsSync(core)) {
  throw new Error('Final architecture quality core helper is missing');
}

let source = fs.readFileSync(core, 'utf8');

const replacements = [
  [
    "const needsPublicId = !/\\bfindByPublicId\\s*:/.test(source);",
    "const needsPublicId = !/\\b(?:async\\s+)?findByPublicId\\s*(?::|\\()/.test(source);",
  ],
  [
    "const needsBookingId = !/\\bfindByBookingId\\s*:/.test(source);",
    "const needsBookingId = !/\\b(?:async\\s+)?findByBookingId\\s*(?::|\\()/.test(source);",
  ],
  [
    "if (!/\\bfindByPublicId\\s*:/.test(source) || !/\\bfindByBookingId\\s*:/.test(source)) {",
    "if (!/\\b(?:async\\s+)?findByPublicId\\s*(?::|\\()/.test(source) || !/\\b(?:async\\s+)?findByBookingId\\s*(?::|\\()/.test(source)) {",
  ],
];

for (const [before, after] of replacements) {
  if (!source.includes(before)) {
    throw new Error(`Unable to locate tracking fixture convergence marker: ${before}`);
  }
  source = source.replace(before, after);
}

fs.writeFileSync(core, source);
console.log('[architecture-closeout-quality] tracking repository fixture detector accepts property and method syntax');

function canonicalizeTrackingRepositoryImports() {
  const repository = path.join(
    root,
    'domains/operations/tracking/infrastructure/repositories/PrismaTrackingSessionRepository.ts',
  );
  if (!fs.existsSync(repository)) return;

  const body = fs.readFileSync(repository, 'utf8')
    .split(/\r?\n/)
    .filter((line) => {
      if (!/^import\b/.test(line.trim())) return true;
      return !/\b(?:ITrackingSessionRepository|TrackingSession|TrackingStatus)\b/.test(line);
    })
    .join('\n')
    .replace(/^\s+/, '');

  const canonicalInterfaceImport = "import type { ITrackingSessionRepository } from '../../domain/ITrackingSessionRepository.js';";
  const header = [
    canonicalInterfaceImport,
    "import { TrackingSession } from '../../domain/TrackingSession.js';",
    "import type { TrackingStatus } from '../../domain/TrackingStatus.js';",
    '',
  ].join('\n');

  fs.writeFileSync(repository, `${header}${body.endsWith('\n') ? body : `${body}\n`}`);

  const finalSource = fs.readFileSync(repository, 'utf8');
  const interfaceImports = finalSource
    .split(/\r?\n/)
    .filter((line) => /^import\b/.test(line.trim()) && /\bITrackingSessionRepository\b/.test(line));

  if (interfaceImports.length !== 1 || interfaceImports[0] !== canonicalInterfaceImport) {
    throw new Error(`Tracking repository interface import is not canonical: ${interfaceImports.join(' | ')}`);
  }
  if (!/implements\s+ITrackingSessionRepository\b/.test(finalSource)) {
    throw new Error('PrismaTrackingSessionRepository no longer implements the canonical tracking repository port');
  }
  if (/@carbroz\/common/.test(finalSource)) {
    throw new Error('PrismaTrackingSessionRepository retains transitional @carbroz/common ownership');
  }
}

function normalizePublicBoundary(relativePath, label) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) return;
  const cleaned = fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter((line) => !line.includes('/infrastructure/') && !line.includes('@prisma/client'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(file, cleaned.endsWith('\n') ? cleaned : `${cleaned}\n`);
  const finalSource = fs.readFileSync(file, 'utf8');
  if (finalSource.includes('/infrastructure/') || finalSource.includes('@prisma/client')) {
    throw new Error(`${label} public boundary still leaks concrete infrastructure`);
  }
}

function normalizeCorporateMoneyFixture() {
  const file = path.join(root, 'tests/integration/domain/corporate.test.ts');
  if (!fs.existsSync(file)) return;

  let body = fs.readFileSync(file, 'utf8');
  body = body.replace(
    /import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"];?/g,
    (full, names, moduleName) => {
      if (moduleName === '@carbroz/foundation-kernel') return full;
      const kept = names
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name && name !== 'Money');
      return kept.length ? `import { ${kept.join(', ')} } from '${moduleName}';` : '';
    },
  );

  body = body.replace(/import\s+\{[^}]*\bMoney\b[^}]*\}\s+from\s+['"]@carbroz\/foundation-kernel['"];?\r?\n?/g, '');
  body = `import { Money } from '@carbroz/foundation-kernel';\n${body.replace(/^\s+/, '')}`;
  fs.writeFileSync(file, body.endsWith('\n') ? body : `${body}\n`);

  const finalSource = fs.readFileSync(file, 'utf8');
  const moneyImports = finalSource.match(/import\s+\{[^}]*\bMoney\b[^}]*\}\s+from\s+['"]@carbroz\/foundation-kernel['"]/g) ?? [];
  if (moneyImports.length !== 1) {
    throw new Error(`Corporate fixture must have exactly one Foundation Money import; found ${moneyImports.length}`);
  }
}

function normalizeTrackingFixtureRuntimePort() {
  const file = path.join(root, 'tests/integration/application/tracking-notification-engine.test.ts');
  if (!fs.existsSync(file)) return;

  let body = fs.readFileSync(file, 'utf8');
  const bookingMethod = /\b(?:async\s+)?findByBookingId\s*(?::|\()/;
  if (!bookingMethod.test(body)) {
    const publicIdMethodLine = /^(\s*)(async\s+findByPublicId\s*\([^\n]*\)\s*\{[^\n]*\},?)\s*$/m;
    if (publicIdMethodLine.test(body)) {
      body = body.replace(publicIdMethodLine, (_full, indent, line) =>
        `${indent}${line}\n${indent}async findByBookingId(_bookingId: number) { return null; },`,
      );
    } else {
      const publicIdPropertyLine = /^(\s*)(findByPublicId\s*:\s*async\s*\([^\n]*\)\s*=>[^\n]*,?)\s*$/m;
      if (publicIdPropertyLine.test(body)) {
        body = body.replace(publicIdPropertyLine, (_full, indent, line) =>
          `${indent}${line}\n${indent}findByBookingId: async (_bookingId: number) => null,`,
        );
      }
    }
  }

  fs.writeFileSync(file, body.endsWith('\n') ? body : `${body}\n`);
  const finalSource = fs.readFileSync(file, 'utf8');
  if (!bookingMethod.test(finalSource)) {
    const diagnostic = finalSource
      .split(/\r?\n/)
      .filter((line) => /findBy|mockTracking|trackingRepo/i.test(line))
      .slice(0, 30)
      .join(' | ');
    throw new Error(`Tracking runtime repository mock still lacks findByBookingId: ${diagnostic}`);
  }
}

try {
  await import('./architecture-closeout-quality-core.mjs');
  canonicalizeTrackingRepositoryImports();
  normalizePublicBoundary('domains/customer/public/index.ts', 'Customer');
  normalizeCorporateMoneyFixture();
  normalizeTrackingFixtureRuntimePort();
  console.log('[architecture-closeout-quality] tracking repository imports, Customer public boundary, corporate Money fixture and tracking runtime mock canonicalized');
} finally {
  fs.rmSync(core, { force: true });
}
