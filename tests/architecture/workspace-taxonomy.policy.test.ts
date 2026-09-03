import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

const CANONICAL_ROOTS = ['apps', 'domains', 'sdui', 'platform', 'foundation', 'prisma', 'tests', 'docs'] as const;
const TRANSITIONAL_ROOTS = ['packages', 'shared'] as const;
const GENERATED_DIRECTORIES = new Set(['node_modules', 'dist', 'coverage', '.turbo']);

const EXPECTED_CHILDREN: Record<string, readonly string[]> = {
  apps: ['api'],
  sdui: ['registry', 'ui-sdk'],
  foundation: ['kernel'],
  packages: ['common', 'config'],
  shared: ['kernel'],
  domains: [
    'audit',
    'booking',
    'catalog-pricing',
    'communications',
    'configuration',
    'customer',
    'dispute',
    'engagement',
    'enterprise',
    'financials',
    'identity',
    'operations',
    'partner',
  ],
  platform: [
    'cache',
    'database',
    'feature-flags',
    'integrations',
    'messaging',
    'observability',
    'storage',
  ],
};

const FINAL_DOMAIN_NAMES = new Set([
  'identity',
  'partner',
  'customer',
  'catalog-pricing',
  'booking',
  'operations',
  'financials',
  'communications',
  'engagement',
  'configuration',
  'dispute',
  'enterprise',
  'audit',
]);

const FINAL_PLATFORM_NAMES = new Set([
  'database',
  'cache',
  'messaging',
  'storage',
  'observability',
  'integrations',
]);

const TRANSITIONAL_PLATFORM_NAMES = new Set(['feature-flags']);

function childDirectories(path: string): string[] {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) return [];

  return readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !GENERATED_DIRECTORIES.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as Record<string, unknown>;
}

function workspacePackageDirectories(): string[] {
  const roots = ['apps', 'domains', 'sdui', 'platform', 'foundation', 'packages', 'shared'];

  return roots.flatMap((workspaceRoot) =>
    childDirectories(workspaceRoot)
      .map((child) => `${workspaceRoot}/${child}`)
      .filter((path) => existsSync(resolve(root, path, 'package.json'))),
  );
}

describe('workspace taxonomy policy', () => {
  it('keeps every workspace package in an explicitly classified root', () => {
    for (const workspaceRoot of [...CANONICAL_ROOTS, ...TRANSITIONAL_ROOTS]) {
      if (workspaceRoot === 'prisma' || workspaceRoot === 'tests' || workspaceRoot === 'docs') continue;
      expect(existsSync(resolve(root, workspaceRoot)), `Missing classified root: ${workspaceRoot}`).toBe(true);
    }
  });

  it('blocks unclassified package creation during the migration', () => {
    for (const [workspaceRoot, expected] of Object.entries(EXPECTED_CHILDREN)) {
      expect(childDirectories(workspaceRoot), `Unexpected package/folder under ${workspaceRoot}/`).toEqual(
        [...expected].sort(),
      );
    }
  });

  it('allows only final constitution domain names', () => {
    const violations = childDirectories('domains').filter((name) => !FINAL_DOMAIN_NAMES.has(name));
    expect(violations, `Unclassified domain packages: ${violations.join(', ')}`).toEqual([]);
  });

  it('keeps Customer fragments physically consolidated under domains/customer', () => {
    expect(childDirectories('domains/customer')).toEqual(['address', 'garage', 'profile', 'public']);
    expect(existsSync(resolve(root, 'domains/address'))).toBe(false);
    expect(existsSync(resolve(root, 'domains/customer-profile'))).toBe(false);
    expect(existsSync(resolve(root, 'domains/garage'))).toBe(false);
  });

  it('allows only canonical or explicitly transitional platform capabilities', () => {
    const violations = childDirectories('platform').filter(
      (name) => !FINAL_PLATFORM_NAMES.has(name) && !TRANSITIONAL_PLATFORM_NAMES.has(name),
    );

    expect(violations, `Unclassified platform packages: ${violations.join(', ')}`).toEqual([]);
  });

  it('keeps transitional catch-all roots closed to new packages', () => {
    expect(childDirectories('packages')).toEqual(['common', 'config']);
    expect(childDirectories('shared')).toEqual(['kernel']);
  });

  it('keeps workspace package identities unique', () => {
    const packages = workspacePackageDirectories().map((path) => {
      const manifest = readJson(`${path}/package.json`);
      return { path, name: manifest.name };
    });

    const invalidNames = packages.filter(({ name }) => typeof name !== 'string' || name.trim().length === 0);
    expect(invalidNames, `Packages without valid names: ${JSON.stringify(invalidNames)}`).toEqual([]);

    const byName = new Map<string, string[]>();
    for (const entry of packages) {
      const name = entry.name as string;
      byName.set(name, [...(byName.get(name) ?? []), entry.path]);
    }

    const duplicates = [...byName.entries()].filter(([, paths]) => paths.length > 1);
    expect(duplicates, `Duplicate workspace package identities: ${JSON.stringify(duplicates)}`).toEqual([]);
  });

  it('keeps canonical package locations fixed while migration progresses', () => {
    expect(readJson('apps/api/package.json').name).toBe('@carbroz/api');
    expect(readJson('sdui/ui-sdk/package.json').name).toBe('@carbroz/ui-sdk');
    expect(readJson('sdui/registry/package.json').name).toBe('@carbroz/sdui-registry');
    expect(readJson('foundation/kernel/package.json').name).toBe('@carbroz/foundation-kernel');
    expect(readJson('domains/customer/package.json').name).toBe('@carbroz/domain-customer');
    expect(readJson('domains/enterprise/package.json').name).toBe('@carbroz/domain-enterprise');
    expect(existsSync(resolve(root, 'domains/garage'))).toBe(false);
  });

  it('keeps migration workspace globs explicit until legacy roots are removed', () => {
    const workspace = readFileSync(resolve(root, 'pnpm-workspace.yaml'), 'utf8');
    const expectedGlobs = [
      '"apps/*"',
      '"domains/*"',
      '"sdui/*"',
      '"platform/*"',
      '"foundation/*"',
      '"packages/*"',
      '"shared/*"',
    ];

    for (const glob of expectedGlobs) {
      expect(workspace).toContain(glob);
    }
  });
});
