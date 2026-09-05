import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function domainPublicIndexes(): string[] {
  const domainsRoot = path.join(root, 'domains');
  if (!fs.existsSync(domainsRoot)) return [];

  return fs.readdirSync(domainsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(domainsRoot, entry.name, 'public', 'index.ts'))
    .filter((file) => fs.existsSync(file));
}

describe('domain public boundary policy', () => {
  it('does not expose concrete infrastructure implementations from domain public entry points', () => {
    const violations = domainPublicIndexes().flatMap((file) => {
      const source = fs.readFileSync(file, 'utf8');
      const matches = source.split(/\r?\n/)
        .filter((line) => /(?:from\s+|export\s+\*\s+from\s+)['"][^'"]*\/infrastructure\//.test(line));
      return matches.map((line) => `${path.relative(root, file)}: ${line.trim()}`);
    });

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
