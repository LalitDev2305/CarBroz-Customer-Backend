import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

function packageName(path: string): string {
  return JSON.parse(read(path)) as { name: string } as unknown as string;
}

describe('canonical repository topology migration', () => {
  it('places the complete SDUI subsystem under the canonical sdui root', () => {
    expect(existsSync(resolve(root, 'sdui/ui-sdk/package.json'))).toBe(true);
    expect(existsSync(resolve(root, 'sdui/registry/package.json'))).toBe(true);
    expect(existsSync(resolve(root, 'packages/sdui-engine'))).toBe(false);
    expect(existsSync(resolve(root, 'domains/sdui-registry'))).toBe(false);
  });

  it('uses the frozen SDUI package identities', () => {
    const uiSdk = JSON.parse(read('sdui/ui-sdk/package.json')) as { name: string };
    const registry = JSON.parse(read('sdui/registry/package.json')) as { name: string; dependencies?: Record<string, string> };

    expect(uiSdk.name).toBe('@carbroz/ui-sdk');
    expect(registry.name).toBe('@carbroz/sdui-registry');
    expect(registry.dependencies?.['@carbroz/ui-sdk']).toBe('workspace:*');
    expect(registry.dependencies?.['@carbroz/sdui-engine']).toBeUndefined();
  });

  it('registers sdui as an explicit workspace category during migration', () => {
    const workspace = read('pnpm-workspace.yaml');
    expect(workspace).toContain('"sdui/*"');
  });

  it('keeps the final taxonomy frozen in the Master Constitution', () => {
    const constitution = read('docs/MASTER-BACKEND-CONSTITUTION.md');
    expect(constitution).toContain('apps/api/');
    expect(constitution).toContain('sdui/ui-sdk/');
    expect(constitution).toContain('sdui/registry/');
    expect(constitution).toContain('domains/customer/');
    expect(constitution).toContain('domains/partner/');
    expect(constitution).toContain('domains/financials/');
    expect(constitution).toContain('platform/integrations/');
  });
});
