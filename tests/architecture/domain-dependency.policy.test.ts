import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const FORBIDDEN_DOMAIN_IMPORTS = [
  '@prisma/client',
  'fastify',
  'awilix',
  '@carbroz/platform-',
];

function gitGrep(pattern: string): string[] {
  const result = spawnSync('git', ['grep', '-n', pattern, '--', 'domains/**/*.ts'], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });

  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr || `git grep failed with status ${result.status}`);
  }

  return (result.stdout ?? '')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.includes('/infrastructure/') && !line.includes('/composition/') && !line.includes('.module.ts'));
}

describe('domain dependency policy', () => {
  it('keeps domain/application source independent from concrete infrastructure', () => {
    const violations = FORBIDDEN_DOMAIN_IMPORTS.flatMap((dependency) => gitGrep(dependency));
    expect(violations, `Forbidden domain-layer dependencies:\n${violations.join('\n')}`).toEqual([]);
  });
});
