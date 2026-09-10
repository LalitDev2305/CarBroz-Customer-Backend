import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function exists(path: string): boolean {
  return existsSync(resolve(root, path));
}

describe('canonical SDUI production definition topology', () => {
  it('keeps every reusable definition level under the canonical engine owner', () => {
    const definitionsRoot = 'sdui/engine/src/nodes';
    const required = ['template', 'component', 'section', 'group', 'element'];

    expect(exists(definitionsRoot)).toBe(true);
    for (const level of required) {
      expect(exists(`${definitionsRoot}/${level}`), level).toBe(true);
      expect(readdirSync(resolve(root, definitionsRoot, level)).length, level).toBeGreaterThan(0);
    }
  });

  it('keeps production definitions out of product-specific domains and API surfaces', () => {
    for (const forbidden of [
      'domains/partner/definitions',
      'domains/customer/definitions',
      'apps/api/src/surfaces/partner/definitions',
      'apps/api/src/surfaces/customer/definitions',
      'sdui/ui-sdk',
    ]) {
      expect(exists(forbidden), forbidden).toBe(false);
    }
  });
});
