import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function domainPublicIndexes(): string[] {
  const domainsRoot = path.join(root, 'domains');
  if (!fs.existsSync(domainsRoot)) return [];

  const indexes: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (entry.isFile() && entry.name === 'index.ts' && path.basename(path.dirname(absolute)) === 'public') {
        indexes.push(absolute);
      }
    }
  };

  visit(domainsRoot);
  return indexes.sort();
}

describe('domain public boundary policy', () => {
  it('does not expose concrete infrastructure implementations from any domain public entry point', () => {
    const violations = domainPublicIndexes().flatMap((file) => {
      const source = fs.readFileSync(file, 'utf8');
      const matches = source.split(/\r?\n/)
        .filter((line) => /(?:from\s+|export\s+\*\s+from\s+)['"][^'"]*\/infrastructure\//.test(line));
      return matches.map((line) => `${path.relative(root, file)}: ${line.trim()}`);
    });

    expect(violations, violations.join('\n')).toEqual([]);
  });
});
