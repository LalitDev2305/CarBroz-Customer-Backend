import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = (x) => fs.existsSync(p(x));
const rel = (x) => path.relative(root, x).replaceAll('\\', '/');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(absolute));
    else out.push(absolute);
  }
  return out;
}

function toJsRelative(fromFile, toFile) {
  let spec = path.relative(path.dirname(fromFile), toFile).replaceAll('\\', '/');
  spec = spec.replace(/\.ts$/, '.js');
  if (!spec.startsWith('.')) spec = `./${spec}`;
  return spec;
}

function resolveRelativeTs(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const raw = path.resolve(path.dirname(fromFile), spec);
  const candidates = [raw, raw.replace(/\.js$/, '.ts'), `${raw}.ts`, path.join(raw, 'index.ts')];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? raw.replace(/\.js$/, '.ts');
}

// Any file we remove/move can already be referenced by migration-rewritten
// relative imports. Rewire those references to the single canonical owner first.
function rewriteReferences(oldAbs, newAbs) {
  for (const file of walk(root).filter((x) => x.endsWith('.ts') || x.endsWith('.mjs'))) {
    let text = fs.readFileSync(file, 'utf8');
    let changed = false;
    text = text.replace(/(['"])(\.[^'"\n]+)\1/g, (all, quote, spec) => {
      const resolved = resolveRelativeTs(file, spec);
      if (!resolved || path.resolve(resolved) !== path.resolve(oldAbs)) return all;
      changed = true;
      return `${quote}${toJsRelative(file, newAbs)}${quote}`;
    });
    if (changed) fs.writeFileSync(file, text);
  }
}

function coalesceFile(duplicateRel, canonicalRel) {
  const duplicate = p(duplicateRel);
  const canonical = p(canonicalRel);
  if (!fs.existsSync(duplicate)) return;
  fs.mkdirSync(path.dirname(canonical), { recursive: true });
  if (fs.existsSync(canonical)) {
    rewriteReferences(duplicate, canonical);
    fs.rmSync(duplicate, { force: true });
    return;
  }
  rewriteReferences(duplicate, canonical);
  fs.renameSync(duplicate, canonical);
}

function coalesceTree(duplicateRel, canonicalRel) {
  const duplicate = p(duplicateRel);
  if (!fs.existsSync(duplicate)) return;
  for (const file of walk(duplicate)) {
    const sub = path.relative(duplicate, file).replaceAll('\\', '/');
    coalesceFile(`${duplicateRel}/${sub}`, `${canonicalRel}/${sub}`);
  }
  fs.rmSync(duplicate, { recursive: true, force: true });
}

// Partner: capability-local profile/KYC trees are canonical.
for (const name of ['PartnerType.ts', 'PartnerStatus.ts', 'PartnerMemberRole.ts', 'PartnerMemberStatus.ts']) {
  coalesceFile(`domains/partner/domain/${name}`, `domains/partner/profile/domain/${name}`);
}
for (const name of ['KycDocumentStatus.ts', 'KycDocumentType.ts']) {
  coalesceFile(`domains/partner/domain/${name}`, `domains/partner/kyc/domain/${name}`);
}
for (const name of ['IPartnerRepository.ts', 'IPartnerMemberRepository.ts', 'IPartnerProfileRepository.ts']) {
  coalesceFile(`domains/partner/domain/repositories/${name}`, `domains/partner/profile/domain/repositories/${name}`);
}
coalesceFile('domains/partner/domain/repositories/IKycDocumentRepository.ts', 'domains/partner/kyc/domain/repositories/IKycDocumentRepository.ts');
for (const name of ['PrismaPartnerRepository.ts', 'PrismaPartnerMemberRepository.ts', 'PrismaPartnerProfileRepository.ts']) {
  coalesceFile(`domains/partner/infrastructure/repositories/${name}`, `domains/partner/profile/infrastructure/repositories/${name}`);
}
coalesceFile('domains/partner/infrastructure/repositories/PrismaKycDocumentRepository.ts', 'domains/partner/kyc/infrastructure/repositories/PrismaKycDocumentRepository.ts');

// Catalog/Pricing: service catalogue and pricing policy are capability-local.
for (const name of ['Service.ts', 'ServiceAddon.ts', 'ServiceCategory.ts']) {
  coalesceFile(`domains/catalog-pricing/domain/${name}`, `domains/catalog-pricing/catalog/domain/${name}`);
}
coalesceFile('domains/catalog-pricing/domain/PricingTier.ts', 'domains/catalog-pricing/pricing/domain/PricingTier.ts');
coalesceFile('domains/catalog-pricing/domain/repositories/ICatalogRepository.ts', 'domains/catalog-pricing/catalog/domain/repositories/ICatalogRepository.ts');
coalesceFile('domains/catalog-pricing/domain/repositories/IPricingRepository.ts', 'domains/catalog-pricing/pricing/domain/repositories/IPricingRepository.ts');
coalesceFile('domains/catalog-pricing/infrastructure/repositories/PrismaCatalogRepository.ts', 'domains/catalog-pricing/catalog/infrastructure/repositories/PrismaCatalogRepository.ts');
coalesceFile('domains/catalog-pricing/infrastructure/repositories/PrismaPricingRepository.ts', 'domains/catalog-pricing/pricing/infrastructure/repositories/PrismaPricingRepository.ts');

// Financials: Payment, Invoice and Payout are internal capabilities. Collapse
// common-package/root-domain copies into their capability-local source trees.
for (const capability of ['payment', 'invoice', 'payout']) {
  coalesceTree(`domains/financials/domain/${capability}`, `domains/financials/${capability}/domain`);
}
coalesceFile('domains/financials/infrastructure/repositories/PrismaPaymentRepository.ts', 'domains/financials/payment/infrastructure/repositories/PrismaPaymentRepository.ts');
coalesceFile('domains/financials/infrastructure/repositories/PrismaInvoiceRepository.ts', 'domains/financials/invoice/infrastructure/repositories/PrismaInvoiceRepository.ts');
coalesceFile('domains/financials/infrastructure/repositories/PrismaPartnerPayoutRepository.ts', 'domains/financials/payout/infrastructure/repositories/PrismaPartnerPayoutRepository.ts');

// Money has exactly one universal implementation. Foundation already owns and
// tests it; remove the old common-package Financials copy and rewire consumers.
coalesceFile('domains/financials/domain/value-objects/Money.ts', 'foundation/kernel/src/domain/Money.ts');

// Operations: Tracking owns tracking sessions/location pings and all tracking
// application behavior. Location primitives that are not tracking-specific may
// remain under Operations domain/location.
for (const name of ['LocationPing.ts', 'TrackingSession.ts']) {
  coalesceFile(`domains/operations/domain/location/${name}`, `domains/operations/tracking/domain/${name}`);
}
coalesceFile('domains/operations/infrastructure/repositories/PrismaTrackingSessionRepository.ts', 'domains/operations/tracking/infrastructure/repositories/PrismaTrackingSessionRepository.ts');
coalesceTree('domains/operations/application/tracking', 'domains/operations/tracking/application');

// Engagement: Review and Coupon keep their capability-local migrated models.
coalesceTree('domains/engagement/domain/review', 'domains/engagement/review/domain');
coalesceTree('domains/engagement/domain/coupon', 'domains/engagement/coupon/domain');
coalesceFile('domains/engagement/infrastructure/repositories/PrismaReviewRepository.ts', 'domains/engagement/review/infrastructure/repositories/PrismaReviewRepository.ts');
coalesceFile('domains/engagement/infrastructure/repositories/PrismaCouponRepository.ts', 'domains/engagement/coupon/infrastructure/repositories/PrismaCouponRepository.ts');
coalesceFile('domains/engagement/infrastructure/repositories/PrismaCouponUsageRepository.ts', 'domains/engagement/coupon/infrastructure/repositories/PrismaCouponUsageRepository.ts');

function pruneEmpty(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
  for (const entry of fs.readdirSync(dir)) {
    const child = path.join(dir, entry);
    if (fs.existsSync(child) && fs.statSync(child).isDirectory()) pruneEmpty(child);
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}
for (const candidate of [
  'domains/partner/domain/repositories',
  'domains/partner/infrastructure/repositories',
  'domains/catalog-pricing/domain/repositories',
  'domains/catalog-pricing/infrastructure/repositories',
  'domains/financials/domain/value-objects',
  'domains/financials/infrastructure/repositories',
  'domains/operations/domain/location',
  'domains/operations/infrastructure/repositories',
  'domains/operations/application',
  'domains/engagement/domain',
  'domains/engagement/infrastructure/repositories',
]) pruneEmpty(p(candidate));

console.log('Backend V3 single-ownership consolidation finalized.');
