import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = (x) => fs.existsSync(p(x));
const rm = (x) => fs.rmSync(p(x), { recursive: true, force: true });

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

function moveInto(sourceRel, targetRel) {
  const source = p(sourceRel);
  const target = p(targetRel);
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(target, { recursive: true });
  for (const file of walk(source)) {
    const sub = path.relative(source, file);
    const destination = path.join(target, sub);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (!fs.existsSync(destination)) fs.renameSync(file, destination);
    else fs.rmSync(file, { force: true });
  }
  fs.rmSync(source, { recursive: true, force: true });
}

function removeIfCanonical(duplicateRel, canonicalRel) {
  if (!exists(duplicateRel)) return;
  if (!exists(canonicalRel)) throw new Error(`Cannot remove duplicate ${duplicateRel}; canonical owner missing: ${canonicalRel}`);
  rm(duplicateRel);
}

// Partner: profile/KYC capability-local definitions are canonical. Root copies
// came from the retired common/platform packages and must not survive.
for (const name of ['PartnerType.ts', 'PartnerStatus.ts', 'PartnerMemberRole.ts', 'PartnerMemberStatus.ts']) {
  removeIfCanonical(`domains/partner/domain/${name}`, `domains/partner/profile/domain/${name}`);
}
for (const name of ['KycDocumentStatus.ts', 'KycDocumentType.ts']) {
  removeIfCanonical(`domains/partner/domain/${name}`, `domains/partner/kyc/domain/${name}`);
}
for (const name of ['IPartnerRepository.ts', 'IPartnerMemberRepository.ts', 'IPartnerProfileRepository.ts']) {
  removeIfCanonical(`domains/partner/domain/repositories/${name}`, `domains/partner/profile/domain/repositories/${name}`);
}
removeIfCanonical('domains/partner/domain/repositories/IKycDocumentRepository.ts', 'domains/partner/kyc/domain/repositories/IKycDocumentRepository.ts');
for (const name of ['PrismaPartnerRepository.ts', 'PrismaPartnerMemberRepository.ts', 'PrismaPartnerProfileRepository.ts']) {
  removeIfCanonical(`domains/partner/infrastructure/repositories/${name}`, `domains/partner/profile/infrastructure/repositories/${name}`);
}
if (exists('domains/partner/infrastructure/repositories/PrismaKycDocumentRepository.ts')) {
  removeIfCanonical('domains/partner/infrastructure/repositories/PrismaKycDocumentRepository.ts', 'domains/partner/kyc/infrastructure/repositories/PrismaKycDocumentRepository.ts');
}

// Catalog/Pricing: keep the capability-local model and persistence trees.
for (const name of ['Service.ts', 'ServiceAddon.ts', 'ServiceCategory.ts']) {
  removeIfCanonical(`domains/catalog-pricing/domain/${name}`, `domains/catalog-pricing/catalog/domain/${name}`);
}
removeIfCanonical('domains/catalog-pricing/domain/PricingTier.ts', 'domains/catalog-pricing/pricing/domain/PricingTier.ts');
for (const name of ['ICatalogRepository.ts']) {
  if (exists(`domains/catalog-pricing/domain/repositories/${name}`)) {
    removeIfCanonical(`domains/catalog-pricing/domain/repositories/${name}`, `domains/catalog-pricing/catalog/domain/repositories/${name}`);
  }
}
if (exists('domains/catalog-pricing/domain/repositories/IPricingRepository.ts')) {
  removeIfCanonical('domains/catalog-pricing/domain/repositories/IPricingRepository.ts', 'domains/catalog-pricing/pricing/domain/repositories/IPricingRepository.ts');
}
for (const [name, capability] of [['PrismaCatalogRepository.ts','catalog'], ['PrismaPricingRepository.ts','pricing']]) {
  removeIfCanonical(`domains/catalog-pricing/infrastructure/repositories/${name}`, `domains/catalog-pricing/${capability}/infrastructure/repositories/${name}`);
}

// Financials: Payment/Invoice/Payout are internal capabilities, not parallel
// root-domain implementations.
for (const capability of ['payment', 'invoice', 'payout']) {
  if (exists(`domains/financials/domain/${capability}`)) rm(`domains/financials/domain/${capability}`);
}
for (const [name, capability] of [
  ['PrismaPaymentRepository.ts','payment'],
  ['PrismaInvoiceRepository.ts','invoice'],
  ['PrismaPartnerPayoutRepository.ts','payout'],
]) {
  removeIfCanonical(`domains/financials/infrastructure/repositories/${name}`, `domains/financials/${capability}/infrastructure/repositories/${name}`);
}

// Operations: Tracking owns its tracking session/ping model and adapter. Merge
// API-migrated tracking application code into that capability-local application.
for (const name of ['LocationPing.ts', 'TrackingSession.ts']) {
  removeIfCanonical(`domains/operations/domain/location/${name}`, `domains/operations/tracking/domain/${name}`);
}
removeIfCanonical('domains/operations/infrastructure/repositories/PrismaTrackingSessionRepository.ts', 'domains/operations/tracking/infrastructure/repositories/PrismaTrackingSessionRepository.ts');
moveInto('domains/operations/application/tracking', 'domains/operations/tracking/application');

// Engagement: Review and Coupon keep their migrated capability-local models.
for (const capability of ['review', 'coupon']) {
  if (exists(`domains/engagement/domain/${capability}`)) rm(`domains/engagement/domain/${capability}`);
}
for (const [name, capability] of [
  ['PrismaReviewRepository.ts','review'],
  ['PrismaCouponRepository.ts','coupon'],
  ['PrismaCouponUsageRepository.ts','coupon'],
]) {
  removeIfCanonical(`domains/engagement/infrastructure/repositories/${name}`, `domains/engagement/${capability}/infrastructure/repositories/${name}`);
}

// Prune empty directories left by de-duplication.
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
  'domains/financials/infrastructure/repositories',
  'domains/operations/domain/location',
  'domains/operations/infrastructure/repositories',
  'domains/engagement/infrastructure/repositories',
]) pruneEmpty(p(candidate));

console.log('Backend V3 single-ownership consolidation finalized.');
