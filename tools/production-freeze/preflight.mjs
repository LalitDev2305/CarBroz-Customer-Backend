import { spawnSync } from 'node:child_process';

const checks = [
  ['build', ['build']],
  ['lint', ['lint']],
  ['architecture', ['exec', 'vitest', 'run', 'tests/architecture']],
  ['tests', ['exec', 'vitest', 'run']],
];

for (const [name, args] of checks) {
  process.stdout.write(`\n[production-freeze] ${name}\n`);
  const result = spawnSync('pnpm', args, {
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
