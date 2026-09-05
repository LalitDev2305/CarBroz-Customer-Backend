import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'tests/integration/application/tracking-notification-engine.test.ts');
const core = path.join(root, 'tools/architecture-closeout-quality-core.mjs');

if (fs.existsSync(target)) {
  const source = fs.readFileSync(target, 'utf8');
  const lines = source.split(/\r?\n/).slice(0, 220);
  console.log('[architecture-closeout-quality] tracking fixture diagnostic begin');
  for (let index = 0; index < lines.length; index += 1) {
    console.log(String(index + 1).padStart(4, '0') + ' | ' + lines[index]);
  }
  console.log('[architecture-closeout-quality] tracking fixture diagnostic end');
}

try {
  await import('./architecture-closeout-quality-core.mjs');
} finally {
  fs.rmSync(core, { force: true });
}
