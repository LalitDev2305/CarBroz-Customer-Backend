import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const transitional = fs.existsSync(path.join(root, 'tools/architecture-closeout.mjs')) || fs.existsSync(path.join(root, 'packages'));
const finalDescribe = transitional ? describe.skip : describe;

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

const requiredRootTestLayers = ['architecture', 'contracts', 'integration', 'e2e'] as const;
const ignored = new Set(['node_modules', 'dist', 'generated', 'coverage', '.git']);
const walk = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
};
const normalize = (value: string) => value.replaceAll('\\', '/');
const isTest = (file: string) => /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file);
const isProductionTs = (file: string) => /\.[cm]?tsx?$/.test(file) && !isTest(file) && !file.endsWith('.d.ts');

finalDescribe('final module completeness policy', () => {
  it('has exactly the canonical production workspaces and no legacy workspace roots', () => {
    for (const workspace of canonicalWorkspaces) expect(fs.existsSync(path.join(root, workspace, 'package.json')), workspace).toBe(true);
    for (const forbidden of ['packages', 'shared', 'libs']) expect(fs.existsSync(path.join(root, forbidden)), forbidden).toBe(false);
  });

  it('has architecture, contract, integration and e2e test layers', () => {
    for (const layer of requiredRootTestLayers) {
      const dir = path.join(root, 'tests', layer);
      expect(fs.existsSync(dir), `tests/${layer}`).toBe(true);
      expect(walk(dir).some(isTest), `tests/${layer} must contain executable tests`).toBe(true);
    }
  });

  it('documents every canonical workspace and supplies executable test evidence for every workspace containing production TypeScript', () => {
    const repositoryTests = walk(path.join(root, 'tests')).filter(isTest).map((file) => ({ file, content: fs.readFileSync(file, 'utf8') }));
    const missingEvidence: string[] = [];

    for (const workspace of canonicalWorkspaces) {
      const dir = path.join(root, workspace);
      expect(fs.existsSync(path.join(dir, 'README.md')), `${workspace}/README.md`).toBe(true);
      const production = walk(dir).filter(isProductionTs);
      if (production.length === 0) continue;

      const localTests = walk(dir).filter(isTest);
      const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')) as { name?: string };
      const externalTests = repositoryTests.filter(({ content }) =>
        content.includes(workspace) || Boolean(manifest.name && content.includes(manifest.name)),
      );
      if (localTests.length === 0 && externalTests.length === 0) missingEvidence.push(workspace);
    }

    expect(missingEvidence, `production workspaces without executable test evidence: ${missingEvidence.join(', ')}`).toEqual([]);
  });

  it('keeps the root README aligned to Backend V3 rather than legacy screen-source architecture', () => {
    const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
    for (const required of [
      'CarBroz Backend V3',
      'MASTER-BACKEND-CONSTITUTION.md',
      '/api/v1/partner/*', '/api/v1/customer/*', '/api/v1/admin/*',
      'Template -> Component -> Element',
      'pnpm test:freeze',
    ]) expect(readme).toContain(required);
    for (const forbidden of ['apps/backend-api/src', 'AuthLoginBuilder', 'src/ui/builders', 'Subcomponents & Children']) {
      expect(readme).not.toContain(forbidden);
    }
  });

  it('does not retain generated build output in canonical source workspaces', () => {
    const trackedLikeResidue = canonicalWorkspaces.flatMap((workspace) => walk(path.join(root, workspace)))
      .map((file) => normalize(path.relative(root, file)))
      .filter((file) => /(^|\/)(?:dist|coverage)\/|\.tsbuildinfo$/.test(file));
    expect(trackedLikeResidue).toEqual([]);
  });
});
