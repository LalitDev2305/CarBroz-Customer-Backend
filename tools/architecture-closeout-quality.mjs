import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function normalizePartnerPublicBoundary() {
  const publicIndex = path.join(root, 'domains/partner/public/index.ts');
  if (!fs.existsSync(publicIndex)) throw new Error('Partner public boundary missing during quality convergence');
  const source = fs.readFileSync(publicIndex, 'utf8');
  const cleaned = source
    .split(/\r?\n/)
    .filter((line) => !line.includes('/infrastructure/') && !line.includes('@prisma/client'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  write(publicIndex, cleaned);
  const finalSource = fs.readFileSync(publicIndex, 'utf8');
  if (finalSource.includes('/infrastructure/') || finalSource.includes('@prisma/client')) {
    throw new Error('Partner public boundary still leaks concrete infrastructure');
  }
}

function normalizeTrackingRepositoryPort() {
  const trackingRoot = path.join(root, 'domains/operations/tracking');
  if (!fs.existsSync(trackingRoot)) return;

  write(path.join(trackingRoot, 'domain/ITrackingSessionRepository.ts'), `import type { TrackingSession } from './TrackingSession.js';

/** Persistence-neutral Operations tracking aggregate repository contract. */
export interface ITrackingSessionRepository {
  create(session: TrackingSession): Promise<TrackingSession>;
  findById(id: number): Promise<TrackingSession | null>;
  findByPublicId(publicId: string): Promise<TrackingSession | null>;
  findByBookingId(bookingId: number): Promise<TrackingSession | null>;
  findActiveByPartnerId(partnerId: number): Promise<TrackingSession | null>;
  update(session: TrackingSession): Promise<TrackingSession>;
}
`);

  const applicationDir = path.join(trackingRoot, 'application');
  for (const file of walk(applicationDir).filter((candidate) => candidate.endsWith('.ts'))) {
    let source = fs.readFileSync(file, 'utf8');
    if (!source.includes('PrismaTrackingSessionRepository')) continue;
    source = source
      .replace(
        /import\s+\{\s*PrismaTrackingSessionRepository\s*\}\s+from\s+['"]\.\.\/infrastructure\/repositories\/PrismaTrackingSessionRepository\.js['"];?\r?\n/g,
        "import type { ITrackingSessionRepository } from '../domain/ITrackingSessionRepository.js';\n",
      )
      .replace(/\bPrismaTrackingSessionRepository\b/g, 'ITrackingSessionRepository');
    fs.writeFileSync(file, source);
  }

  const prismaRepository = path.join(trackingRoot, 'infrastructure/repositories/PrismaTrackingSessionRepository.ts');
  if (fs.existsSync(prismaRepository)) {
    let source = fs.readFileSync(prismaRepository, 'utf8');
    if (!source.includes("../../domain/ITrackingSessionRepository.js")) {
      source = `import type { ITrackingSessionRepository } from '../../domain/ITrackingSessionRepository.js';\n${source}`;
    }
    source = source.replace(
      /import\s+\{\s*ITrackingSessionRepository\s*,\s*TrackingSession\s*,\s*TrackingStatus\s*\}\s+from\s+['"][^'"]+['"];?\r?\n/g,
      "import { TrackingSession } from '../../domain/TrackingSession.js';\nimport type { TrackingStatus } from '../../domain/TrackingStatus.js';\n",
    );
    fs.writeFileSync(prismaRepository, source);
  }

  const applicationLeak = walk(applicationDir)
    .filter((candidate) => candidate.endsWith('.ts'))
    .filter((file) => /PrismaTrackingSessionRepository|\/infrastructure\//.test(fs.readFileSync(file, 'utf8')));
  if (applicationLeak.length) {
    throw new Error(`Tracking application still depends on concrete infrastructure: ${applicationLeak.join(', ')}`);
  }
}

function normalizeBehavioralEvidence() {
  write(path.join(root, 'tests/architecture/api-booking-ownership.policy.test.ts'), String.raw`import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

describe('API Booking ownership policy', () => {
  it('removes Booking application behavior from apps/api', () => {
    const offenders = walk(path.join(root, 'apps/api/src'))
      .filter((file) => file.endsWith('.ts'))
      .filter((file) => /class\s+\w+UseCase\b/.test(fs.readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('keeps Booking lifecycle in Booking and dispatch assignment in Operations', () => {
    const booking = fs.readFileSync(path.join(root, 'domains/booking/application/BookingUseCases.ts'), 'utf8');
    for (const owner of ['CreateBookingUseCase', 'ConfirmBookingUseCase', 'TransitionBookingStatusUseCase', 'CancelBookingUseCase', 'ExpirePendingBookingsUseCase']) {
      expect(booking).toContain('class ' + owner);
    }
    expect(booking).not.toContain('class AssignPartnerToBookingUseCase');

    const dispatch = fs.readFileSync(path.join(root, 'domains/operations/application/dispatch/AssignPartnerToBookingUseCase.ts'), 'utf8');
    const operationsPublic = fs.readFileSync(path.join(root, 'domains/operations/public/index.ts'), 'utf8');
    expect(dispatch).toContain('class AssignPartnerToBookingUseCase');
    expect(operationsPublic).toContain('AssignPartnerToBookingUseCase');
  });
});
`);

  const corporateTest = path.join(root, 'tests/integration/domain/corporate.test.ts');
  if (fs.existsSync(corporateTest)) {
    let source = fs.readFileSync(corporateTest, 'utf8');
    source = source.replace(
      /import\s+\{([^}]*)\}\s+from\s+['"]@carbroz\/domain-enterprise['"];?/g,
      (_full, names) => {
        const kept = names.split(',').map((name) => name.trim()).filter((name) => name && name !== 'Money');
        return kept.length ? `import { ${kept.join(', ')} } from '@carbroz/domain-enterprise';` : '';
      },
    );
    if (!/import\s+\{[^}]*\bMoney\b[^}]*\}\s+from\s+['"]@carbroz\/foundation-kernel['"]/.test(source)) {
      source = `import { Money } from '@carbroz/foundation-kernel';\n${source}`;
    }
    fs.writeFileSync(corporateTest, source);
  }

  const trackingTest = path.join(root, 'tests/integration/application/tracking-notification-engine.test.ts');
  if (fs.existsSync(trackingTest)) {
    let source = fs.readFileSync(trackingTest, 'utf8');
    if (!source.includes('findByBookingId:')) {
      const marker = /(^\s*findByPublicId:\s*async[^\n]*\n)/m;
      if (!marker.test(source)) throw new Error('Tracking integration repository mock shape changed; findByBookingId cannot be inserted safely');
      source = source.replace(marker, `    findByBookingId: async () => null,\n$1`);
    }
    fs.writeFileSync(trackingTest, source);
  }
}

normalizePartnerPublicBoundary();
normalizeTrackingRepositoryPort();
normalizeBehavioralEvidence();

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
    const offenders: string[] = [];
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
`);

console.log('[architecture-closeout-quality] Partner public boundary, Operations tracking port, behavioral evidence, topology and engineering policies normalized');
