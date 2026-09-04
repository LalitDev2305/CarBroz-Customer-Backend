import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const configurationRoot = resolve(root, 'domains/configuration');

function sourceFiles(path: string): string[] {
  return readdirSync(path).flatMap((entry) => {
    const absolute = resolve(path, entry);
    if (statSync(absolute).isDirectory()) {
      if (entry === 'dist' || entry === 'node_modules') return [];
      return sourceFiles(absolute);
    }
    return entry.endsWith('.ts') ? [absolute] : [];
  });
}

describe('configuration common boundary policy', () => {
  it('keeps the Configuration domain independent of the transitional common package', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(configurationRoot, 'package.json'), 'utf8'),
    ) as { dependencies?: Record<string, string> };

    expect(manifest.dependencies?.['@carbroz/common']).toBeUndefined();
    expect(manifest.dependencies?.['@carbroz/foundation-kernel']).toBe('workspace:*');

    const violations = sourceFiles(configurationRoot)
      .filter((path) => readFileSync(path, 'utf8').includes("from '@carbroz/common'"))
      .map((path) => path.replace(`${root}/`, ''));

    expect(violations, `Configuration still imports Common: ${violations.join(', ')}`).toEqual([]);
  });
});
