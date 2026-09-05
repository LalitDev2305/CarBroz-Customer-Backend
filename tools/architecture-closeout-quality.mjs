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

  const header = [
    "import type { ITrackingSessionRepository } from '../../domain/ITrackingSessionRepository.js';",
    "import { TrackingSession } from '../../domain/TrackingSession.js';",
    "import type { TrackingStatus } from '../../domain/TrackingStatus.js';",
    '',
  ].join('\n');

  fs.writeFileSync(repository, `${header}${body.endsWith('\n') ? body : `${body}\n`}`);

  const finalSource = fs.readFileSync(repository, 'utf8');
  const matches = finalSource.match(/\bITrackingSessionRepository\b/g) ?? [];
  if (matches.length !== 2) {
    throw new Error(`Tracking repository interface authority is not canonical after import convergence: ${matches.length} references`);
  }
}

try {
  await import('./architecture-closeout-quality-core.mjs');
  canonicalizeTrackingRepositoryImports();
  console.log('[architecture-closeout-quality] tracking repository imports canonicalized');
} finally {
  fs.rmSync(core, { force: true });
}
