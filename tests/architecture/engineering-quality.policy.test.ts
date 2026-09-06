import fs from 'node:fs';
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
    const offenders = production.filter((file) => /from\s+['"]@carbroz\/common['"]/.test(fs.readFileSync(file, 'utf8'))).map(relative);
    expect(offenders).toEqual([]);
  });

  it('forbids framework, persistence, DI and infrastructure dependencies from domain/application layers', () => {
    const domainFiles = production.filter((file) => {
      const parts = relative(file).split('/');
      return parts[0] === 'domains' && (parts.includes('domain') || parts.includes('application'));
    });
    const forbiddenImport = /from\s+['"](?:fastify|@prisma\/client|prisma|redis|ioredis|awilix|@aws-sdk\/|razorpay|firebase-admin|twilio)[^'"]*['"]/;
    const offenders = domainFiles.filter((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return forbiddenImport.test(content) || /from\s+['"][^'"]*\/infrastructure\/[^'"]*['"]/.test(content) || content.includes('process.env') || content.includes("from 'node:fs'") || content.includes('from "node:fs"');
    }).map(relative);
    expect(offenders).toEqual([]);
  });

  it('forbids deep package imports and relative imports into another bounded context', () => {
    const offenders = [];
    for (const file of production.filter((candidate) => relative(candidate).startsWith('domains/'))) {
      const sourceParts = relative(file).split('/');
      const sourceDomain = sourceParts[1];
      const content = fs.readFileSync(file, 'utf8');
      for (const match of content.matchAll(/from\s+['"](@carbroz\/domain-[^'"]+)\/[^'"]+['"]/g)) offenders.push(relative(file) + ' -> deep ' + match[1]);
      for (const match of content.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
        const target = path.resolve(path.dirname(file), match[1]);
        const targetParts = relative(target).split('/');
        if (targetParts[0] === 'domains' && targetParts[1] !== sourceDomain) offenders.push(relative(file) + ' -> ' + match[1]);
      }
    }
    expect([...new Set(offenders)]).toEqual([]);
  });

  it('keeps platform/database free of business repository ownership', () => {
    const files = walk(path.join(root, 'platform/database')).filter((file) => file.endsWith('.ts'));
    const businessRepository = /(?:Booking|Partner|Customer|Payment|Invoice|Payout|Review|Coupon|Dispute|Corporate|Notification).*Repository/;
    expect(files.filter((file) => businessRepository.test(fs.readFileSync(file, 'utf8'))).map(relative)).toEqual([]);
  });

  it('forbids secret-bearing logs and raw authorization metadata in production source', () => {
    const unsafe = /(?:log|logger)\.(?:trace|debug|info|warn|error|fatal)\([^\n]*(?:otp|refreshToken|accessToken|authorization|password|phone|email)/i;
    expect(production.filter((file) => unsafe.test(fs.readFileSync(file, 'utf8'))).map(relative)).toEqual([]);
  });
});
