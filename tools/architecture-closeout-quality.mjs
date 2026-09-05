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

function printTrackingExecuteRangeAndStop() {
  const file = path.join(root, 'tests/integration/application/tracking-notification-engine.test.ts');
  if (!fs.existsSync(file)) throw new Error('Generated tracking integration fixture is missing');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const start = 118;
  const end = Math.min(lines.length, 158);
  const snippet = lines.slice(start - 1, end).map((line, index) => `${start + index}: ${line}`).join('\n');
  console.log('[architecture-closeout-quality][tracking-execute-range]\n' + snippet);
  throw new Error('TRACKING_EXECUTE_RANGE_CAPTURED');
}

try {
  await import('./architecture-closeout-quality-core.mjs');
  printTrackingExecuteRangeAndStop();
} finally {
  fs.rmSync(core, { force: true });
}
