import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const appSource = fs.readFileSync(path.join(root, 'apps/api/src/app.ts'), 'utf8');

describe('API version prefix policy', () => {
  it('keeps shared auth and configuration endpoints inside the canonical /api/v1 namespace', () => {
    expect(appSource).toContain("prefix: '/api/v1/auth'");
    expect(appSource).toContain("prefix: '/api/v1/config'");
  });

  it('does not register obsolete root /v1 transport prefixes', () => {
    const obsoletePrefixes = [...appSource.matchAll(/prefix:\s*['"](\/v1\/[^'"]*)['"]/g)]
      .map((match) => match[1]);

    expect(obsoletePrefixes).toEqual([]);
  });
});
