import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('canonical repository topology migration', () => {
  it('places the executable API at the canonical path and identity', () => {
    expect(existsSync(resolve(root, 'apps/api/package.json'))).toBe(true);
    expect(existsSync(resolve(root, 'apps/backend-api'))).toBe(false);

    const api = JSON.parse(read('apps/api/package.json')) as { name?: string };
    expect(api.name).toBe('@carbroz/api');
  });

  it('places the complete SDUI subsystem under the canonical sdui root', () => {
    expect(existsSync(resolve(root, 'sdui/ui-sdk/package.json'))).toBe(true);
    expect(existsSync(resolve(root, 'sdui/registry/package.json'))).toBe(true);
    expect(existsSync(resolve(root, 'packages/sdui-engine'))).toBe(false);
    expect(existsSync(resolve(root, 'domains/sdui-registry'))).toBe(false);
  });

  it('uses the frozen SDUI package identities', () => {
    const uiSdk = JSON.parse(read('sdui/ui-sdk/package.json')) as { name: string };
    const registry = JSON.parse(read('sdui/registry/package.json')) as {
      name: string;
      dependencies?: Record<string, string>;
    };

    expect(uiSdk.name).toBe('@carbroz/ui-sdk');
    expect(registry.name).toBe('@carbroz/sdui-registry');
    expect(registry.dependencies?.['@carbroz/ui-sdk']).toBe('workspace:*');
    expect(registry.dependencies?.['@carbroz/sdui-engine']).toBeUndefined();
  });

  it('does not retain a competing prompt-based architecture authority', () => {
    expect(existsSync(resolve(root, 'prompts'))).toBe(false);
  });

  it('registers sdui as an explicit workspace category during migration', () => {
    const workspace = read('pnpm-workspace.yaml');
    expect(workspace).toContain('"sdui/*"');
  });

  it('keeps the final taxonomy frozen in the Master Constitution', () => {
    const constitution = read('docs/MASTER-BACKEND-CONSTITUTION.md');

    expect(constitution).toContain('├── apps/');
    expect(constitution).toContain('│   └── api/');
    expect(constitution).toContain('├── domains/');
    expect(constitution).toContain('│   ├── customer/');
    expect(constitution).toContain('│   ├── partner/');
    expect(constitution).toContain('│   ├── financials/');
    expect(constitution).toContain('├── sdui/');
    expect(constitution).toContain('│   ├── ui-sdk/');
    expect(constitution).toContain('│   └── registry/');
    expect(constitution).toContain('│   └── integrations/');
  });
});
