import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

write(path.join(root, 'tests/architecture/canonical-topology.policy.test.ts'), String.raw`import fs from 'node:fs';
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
      ...packageDirectories('apps'),
      ...packageDirectories('domains'),
      ...packageDirectories('sdui'),
      ...packageDirectories('platform'),
      ...packageDirectories('foundation'),
    ].sort();
    expect(actual).toEqual([...canonicalWorkspaces].sort());
  });

  it('does not retain transitional source roots', () => {
    for (const forbidden of ['packages', 'shared', 'libs']) {
      expect(fs.existsSync(path.join(root, forbidden)), forbidden).toBe(false);
    }
  });

  it('keeps apps/api transport and composition only', () => {
    const api = path.join(root, 'apps/api/src');
    for (const forbidden of ['modules', 'providers', 'container']) {
      expect(fs.existsSync(path.join(api, forbidden)), 'apps/api/src/' + forbidden).toBe(false);
    }
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
`);

write(path.join(root, 'tests/architecture/engineering-quality.policy.test.ts'), String.raw`import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
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

const production = ['apps', 'domains', 'sdui', 'platform', 'foundation']
  .flatMap((dir) => walk(path.join(root, dir)))
  .filter((file) => file.endsWith('.ts') && !/\.(?:test|spec)\.ts$/.test(file));

describe('Backend V3 engineering quality boundaries', () => {
  it('forbids the transitional common package from production imports', () => {
    const offenders = production
      .filter((file) => /from\s+['"]@carbroz\/common['"]/.test(fs.readFileSync(file, 'utf8')))
      .map(relative);
    expect(offenders).toEqual([]);
  });

  it('forbids framework, persistence, DI and process environment access from domain/application layers', () => {
    const domainFiles = production.filter((file) => {
      const parts = relative(file).split('/');
      return parts[0] === 'domains' && (parts.includes('domain') || parts.includes('application'));
    });
    const forbiddenImport = /from\s+['"](?:fastify|@prisma\/client|prisma|redis|ioredis|awilix|@aws-sdk\/|razorpay|firebase-admin|twilio)[^'"]*['"]/;
    const offenders = domainFiles.filter((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return forbiddenImport.test(content) || content.includes('process.env') || content.includes("from 'node:fs'") || content.includes('from "node:fs"');
    }).map(relative);
    expect(offenders).toEqual([]);
  });

  it('forbids deep package imports and relative imports into another bounded context', () => {
    const offenders: string[] = [];
    for (const file of production.filter((candidate) => relative(candidate).startsWith('domains/'))) {
      const sourceParts = relative(file).split('/');
      const sourceDomain = sourceParts[1];
      const content = fs.readFileSync(file, 'utf8');

      for (const match of content.matchAll(/from\s+['"](@carbroz\/domain-[^'"]+)\/[^'"]+['"]/g)) {
        offenders.push(relative(file) + ' -> deep ' + match[1]);
      }

      for (const match of content.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
        const target = path.resolve(path.dirname(file), match[1]);
        const targetRelative = relative(target);
        const targetParts = targetRelative.split('/');
        if (targetParts[0] === 'domains' && targetParts[1] !== sourceDomain) {
          offenders.push(relative(file) + ' -> ' + match[1]);
        }
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
  });

  it('keeps platform/database free of business repository ownership', () => {
    const files = walk(path.join(root, 'platform/database')).filter((file) => file.endsWith('.ts'));
    const businessRepository = /(?:Booking|Partner|Customer|Payment|Invoice|Payout|Review|Coupon|Dispute|Corporate|Notification).*Repository/;
    const offenders = files.filter((file) => businessRepository.test(fs.readFileSync(file, 'utf8'))).map(relative);
    expect(offenders).toEqual([]);
  });

  it('forbids secret-bearing logs and raw authorization metadata in production source', () => {
    const unsafe = /(?:log|logger)\.(?:trace|debug|info|warn|error|fatal)\([^\n]*(?:otp|refreshToken|accessToken|authorization|password|phone|email)/i;
    const offenders = production.filter((file) => unsafe.test(fs.readFileSync(file, 'utf8'))).map(relative);
    expect(offenders).toEqual([]);
  });
});
`);

console.log('[architecture-closeout-quality] parse-safe canonical topology and engineering quality policies normalized');
