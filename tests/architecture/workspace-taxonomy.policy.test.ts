import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const finalDescribe = existsSync(resolve(root, 'packages')) ? describe.skip : describe;
const ignored = new Set(['node_modules', 'dist', 'coverage', '.turbo']);
const expectedChildren: Record<string, readonly string[]> = {
  apps: ['api'],
  sdui: ['registry', 'ui-sdk'],
  foundation: ['kernel'],
  domains: ['audit', 'booking', 'catalog-pricing', 'communications', 'configuration', 'customer', 'dispute', 'engagement', 'enterprise', 'financials', 'identity', 'operations', 'partner'],
  platform: ['cache', 'database', 'integrations', 'messaging', 'observability', 'storage'],
};

function childDirectories(dir: string): string[] {
  const absolute = resolve(root, dir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !ignored.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function packageName(dir: string): string {
  return (JSON.parse(readFileSync(resolve(root, dir, 'package.json'), 'utf8')) as { name: string }).name;
}

finalDescribe('workspace taxonomy policy', () => {
  it('contains only canonical workspace roots and no transitional catch-all roots', () => {
    for (const dir of ['apps', 'domains', 'sdui', 'platform', 'foundation']) expect(existsSync(resolve(root, dir))).toBe(true);
    for (const dir of ['packages', 'shared', 'libs']) expect(existsSync(resolve(root, dir))).toBe(false);
  });

  it('keeps exact canonical package children', () => {
    for (const [dir, expected] of Object.entries(expectedChildren)) expect(childDirectories(dir)).toEqual([...expected].sort());
  });

  it('keeps canonical package identities unique and fixed', () => {
    const dirs = Object.entries(expectedChildren).flatMap(([rootDir, children]) => children.map((child) => `${rootDir}/${child}`));
    const names = dirs.map((dir) => packageName(dir));
    expect(new Set(names).size).toBe(names.length);
    expect(packageName('apps/api')).toBe('@carbroz/api');
    expect(packageName('foundation/kernel')).toBe('@carbroz/foundation-kernel');
    expect(packageName('sdui/ui-sdk')).toBe('@carbroz/ui-sdk');
    expect(packageName('sdui/registry')).toBe('@carbroz/sdui-registry');
  });

  it('uses only final workspace globs', () => {
    const workspace = readFileSync(resolve(root, 'pnpm-workspace.yaml'), 'utf8');
    for (const glob of ['apps/*', 'domains/*', 'sdui/*', 'platform/*', 'foundation/*']) expect(workspace).toContain(glob);
    expect(workspace).not.toContain('packages/*');
    expect(workspace).not.toContain('shared/*');
  });
});
