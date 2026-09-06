import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const canonicalWorkspaces = [
  'apps/api',
  'domains/identity', 'domains/partner', 'domains/customer', 'domains/catalog-pricing',
  'domains/booking', 'domains/operations', 'domains/financials', 'domains/communications',
  'domains/engagement', 'domains/configuration', 'domains/dispute', 'domains/enterprise', 'domains/audit',
  'sdui/ui-sdk', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage',
  'platform/observability', 'platform/integrations',
  'foundation/kernel',
] as const;
const ignored = new Set(['node_modules', 'dist', 'coverage', 'generated', '.git']);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function relative(file: string): string {
  return path.relative(root, file).split(path.sep).join('/');
}

function packageDirectories(base: string): string[] {
  const absolute = path.join(root, base);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(absolute, entry.name, 'package.json')))
    .map((entry) => base + '/' + entry.name)
    .sort();
}

describe('canonical Backend V3 topology', () => {
  it('contains exactly the canonical production workspaces', () => {
    const actual = [
      ...packageDirectories('apps'), ...packageDirectories('domains'), ...packageDirectories('sdui'),
      ...packageDirectories('platform'), ...packageDirectories('foundation'),
    ].sort();
    expect(actual).toEqual([...canonicalWorkspaces].sort());
  });

  it('does not retain transitional source roots', () => {
    for (const forbidden of ['packages', 'shared', 'libs']) expect(fs.existsSync(path.join(root, forbidden)), forbidden).toBe(false);
  });

  it('keeps apps/api transport and composition only', () => {
    const api = path.join(root, 'apps/api/src');
    for (const forbidden of ['modules', 'providers', 'container']) expect(fs.existsSync(path.join(api, forbidden)), 'apps/api/src/' + forbidden).toBe(false);
    const businessImplementations = walk(api)
      .filter((file) => file.endsWith('.ts'))
      .filter((file) => /class\s+\w+UseCase\b/.test(fs.readFileSync(file, 'utf8')))
      .map(relative);
    expect(businessImplementations).toEqual([]);
  });

  it('contains exactly two SDUI workspaces and no legacy structural vocabulary in production SDUI source', () => {
    expect(packageDirectories('sdui')).toEqual(['sdui/registry', 'sdui/ui-sdk']);
    const legacy = walk(path.join(root, 'sdui'))
      .filter((file) => file.endsWith('.ts'))
      .filter((file) => /\b(?:Subcomponent|SubComponent|ChildrenData)\b/.test(fs.readFileSync(file, 'utf8')))
      .map(relative);
    expect(legacy).toEqual([]);
  });

  it('does not retain generated build output inside canonical workspaces', () => {
    const residue = canonicalWorkspaces.flatMap((workspace) => walk(path.join(root, workspace)))
      .map(relative)
      .filter((file) => /(?:^|\/)(?:dist|coverage|generated)\/|\.tsbuildinfo$/.test(file));
    expect(residue).toEqual([]);
  });
});
