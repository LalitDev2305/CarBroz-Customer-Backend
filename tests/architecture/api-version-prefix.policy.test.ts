import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const finalCompositionRoot = path.join(root, 'apps/api/src/bootstrap/app.ts');
const transitionalCompositionRoot = path.join(root, 'apps/api/src/app.ts');
const compositionRoot = fs.existsSync(finalCompositionRoot)
  ? finalCompositionRoot
  : transitionalCompositionRoot;

if (!fs.existsSync(compositionRoot)) {
  throw new Error('Canonical API composition root not found');
}

const appSource = fs.readFileSync(compositionRoot, 'utf8');
const isFinalComposition = compositionRoot === finalCompositionRoot;

describe('API version prefix policy', () => {
  it('keeps API transport inside the canonical /api/v1 namespace during migration and after closeout', () => {
    if (isFinalComposition) {
      expect(appSource).toContain("prefix: '/api/v1/partner'");
      expect(appSource).toContain("prefix: '/api/v1/customer'");
      expect(appSource).toContain("prefix: '/api/v1/admin'");
      expect(appSource).not.toContain("prefix: '/api/v1/auth'");
      expect(appSource).not.toContain("prefix: '/api/v1/config'");
      return;
    }

    expect(appSource).toContain("prefix: '/api/v1/auth'");
    expect(appSource).toContain("prefix: '/api/v1/config'");
  });

  it('does not register obsolete root /v1 transport prefixes', () => {
    const obsoletePrefixes = [...appSource.matchAll(/prefix:\s*['"](\/v1(?:\/[^'"]*)?)['"]/g)]
      .map((match) => match[1]);

    expect(obsoletePrefixes).toEqual([]);
  });
});
