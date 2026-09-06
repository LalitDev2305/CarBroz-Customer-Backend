import { spawnSync } from 'node:child_process';

const checks = [
  ['cw2-architecture', 'node', ['tools/architecture-closeout.mjs']],
  ['cw1-cw2-constitution-regression', 'node', ['tools/architecture-closeout-constitution-gate.mjs', '--regression']],
  ['build', 'pnpm', ['build']],
  ['lint', 'pnpm', ['lint']],
  ['architecture-tests', 'pnpm', ['exec', 'vitest', 'run', 'tests/architecture']],
  ['tests', 'pnpm', ['exec', 'vitest', 'run']],
  ['cw1-cw2-constitution-regression-post-validation', 'node', ['tools/architecture-closeout-constitution-gate.mjs', '--regression']],
];

for (const [name, command, args] of checks) {
  process.stdout.write(`\n[production-freeze] ${name}\n`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error(`[production-freeze] ${name} could not start:`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[production-freeze] ${name} failed with exit code ${result.status ?? 'unknown'}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\n[production-freeze] preflight PASS');
