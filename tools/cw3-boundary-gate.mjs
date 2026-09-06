import fs from 'node:fs';
import path from 'node:path';

/**
 * CW3 bounded-context and dependency convergence verifier.
 *
 * This verifier is intentionally read-only. It permanently protects the ownership/dependency
 * boundaries closed by CW3 without changing source, manifests or generated state.
 */
const root = process.cwd();
const violations = [];

const toRel = (file) => path.relative(root, file).replaceAll('\\', '/');
const exists = (relative) => fs.existsSync(path.join(root, relative));
const required = (relative, reason) => {
  if (!exists(relative)) violations.push(`${relative}: ${reason}`);
};
const forbidden = (relative, reason) => {
  if (exists(relative)) violations.push(`${relative}: ${reason}`);
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'coverage', 'generated', '.git'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function sourceFiles(base) {
  return walk(path.join(root, base)).filter((file) => /\.(?:ts|mts|cts)$/.test(file));
}

function imports(content) {
  return [...content.matchAll(/(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

function readJson(relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    violations.push(`${relative}: required package manifest is missing`);
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    violations.push(`${relative}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    return {};
  }
}

function rejectDependency(manifestPath, dependency, reason) {
  const manifest = readJson(manifestPath);
  const declared = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.devDependencies ?? {}),
    ...(manifest.peerDependencies ?? {}),
    ...(manifest.optionalDependencies ?? {}),
  };
  if (Object.hasOwn(declared, dependency)) violations.push(`${manifestPath}: ${reason} (${dependency})`);
}

// Enterprise owns corporate policy only; Financials owns invoice/ledger/payment accounting.
for (const file of sourceFiles('domains/enterprise')) {
  const rel = toRel(file);
  const content = fs.readFileSync(file, 'utf8');
  if (/(?:Invoice|Payment|Settlement|Ledger)/.test(rel)
      || /\b(?:CorporateCreditLedger|CorporateInvoice|ReconcileCorporatePayment|GenerateCorporateInvoice)\b/.test(content)) {
    violations.push(`${rel}: Enterprise accounting authority survived CW3; Financials is the sole accounting owner`);
  }
}
required('domains/enterprise/application/ports/ICorporateCreditAccountingPort.ts', 'Enterprise must depend on semantic Financials accounting behavior through a port');
required('domains/financials/invoice/corporate/domain/CorporateInvoice.ts', 'Financials-owned corporate invoice aggregate is missing');
required('domains/financials/ledger/corporate/domain/CorporateCreditLedger.ts', 'Financials-owned corporate ledger aggregate is missing');
required('domains/financials/ledger/corporate/application/services/CorporateCreditAccountingService.ts', 'Financials-owned corporate accounting service is missing');
rejectDependency('domains/enterprise/package.json', '@carbroz/domain-booking', 'stale Booking dependency violates Enterprise ownership convergence');
rejectDependency('domains/enterprise/package.json', '@carbroz/domain-communications', 'stale Communications dependency violates Enterprise ownership convergence');
rejectDependency('domains/enterprise/package.json', '@carbroz/domain-financials', 'Enterprise must not depend directly on the Financials implementation package');

// Booking owns booking state; Operations owns assignment/dispatch/tracking/execution coordination.
required('domains/operations/application/dispatch/AssignPartnerToBookingUseCase.ts', 'Operations dispatch authority is missing');
required('domains/operations/tracking/application/UpdateLiveGpsLocationUseCase.ts', 'canonical Operations live-tracking use case is missing');
required('domains/operations/tracking/domain/repositories/ITrackingSessionRepository.ts', 'canonical Operations tracking repository contract is missing');
forbidden('domains/operations/tracking/domain/ITrackingSessionRepository.ts', 'duplicate tracking repository authority survived CW3');
for (const file of sourceFiles('domains/booking')) {
  const rel = toRel(file);
  const content = fs.readFileSync(file, 'utf8');
  if (/(?:dispatch|tracking|slot-inventory|capacity|partner-assignment)/i.test(rel)) {
    violations.push(`${rel}: Operations-owned capability remains physically under Booking`);
  }
  if (/\b(?:AssignPartnerToBookingUseCase|TrackingSession|UpdateLiveGpsLocationUseCase)\b/.test(content)) {
    violations.push(`${rel}: Booking source owns or embeds Operations assignment/tracking authority`);
  }
}
rejectDependency('domains/booking/package.json', '@carbroz/domain-partner', 'Booking must not depend on Partner after assignment authority converged to Operations');

// Partner is the sole owner of profile/member/KYC authority. The root application layer may
// orchestrate the canonical KYC submodule, but no competing models/repositories may exist elsewhere.
for (const requiredPartnerFile of [
  'domains/partner/domain/Partner.ts',
  'domains/partner/domain/PartnerProfile.ts',
  'domains/partner/domain/repositories/IPartnerProfileRepository.ts',
  'domains/partner/kyc/domain/KycDocument.ts',
  'domains/partner/kyc/domain/repositories/IKycDocumentRepository.ts',
  'domains/partner/application/use-cases/UploadKycDocumentUseCase.ts',
]) required(requiredPartnerFile, 'canonical Partner/Profile/KYC ownership evidence is missing');
for (const base of ['apps', 'domains', 'sdui', 'platform', 'foundation']) {
  for (const file of sourceFiles(base)) {
    const rel = toRel(file);
    if (rel.startsWith('domains/partner/')) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (/\bclass\s+(?:PartnerProfile|KycDocument)\b/.test(content)
        || /\binterface\s+(?:IPartnerProfileRepository|IKycDocumentRepository)\b/.test(content)) {
      violations.push(`${rel}: duplicate Partner/Profile/KYC authority exists outside domains/partner`);
    }
  }
}
rejectDependency('domains/partner/package.json', '@carbroz/platform-storage', 'Partner must consume semantic KYC storage ports rather than a platform implementation package');

// Cross-context access must use package public boundaries. Deep imports into another domain are forbidden.
for (const file of sourceFiles('domains')) {
  const rel = toRel(file);
  const owner = rel.match(/^domains\/([^/]+)\//)?.[1];
  const content = fs.readFileSync(file, 'utf8');
  for (const specifier of imports(content)) {
    const target = specifier.match(/^@carbroz\/domain-([^/]+)(\/.*)?$/);
    if (target && target[1] !== owner && target[2] && !/^\/public(?:\/|$)/.test(target[2])) {
      violations.push(`${rel}: deep cross-domain import bypasses the target public boundary (${specifier})`);
    }
  }
}
for (const file of walk(path.join(root, 'domains')).filter((candidate) => candidate.endsWith('/public/index.ts'))) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('/infrastructure/') || content.includes('@prisma/client')) {
    violations.push(`${toRel(file)}: domain public boundary exposes concrete persistence infrastructure`);
  }
}

// Product surfaces remain isolated, and both SDUI workspaces remain generic/product-neutral.
for (const [base, forbiddenSurface] of [
  ['apps/api/src/surfaces/partner', /surfaces\/(?:customer|admin)/],
  ['apps/api/src/surfaces/customer', /surfaces\/(?:partner|admin)/],
  ['apps/api/src/surfaces/admin', /surfaces\/(?:partner|customer)/],
]) {
  for (const file of sourceFiles(base)) {
    for (const specifier of imports(fs.readFileSync(file, 'utf8'))) {
      if (forbiddenSurface.test(specifier)) violations.push(`${toRel(file)}: product surface imports another surface's internals (${specifier})`);
    }
  }
}
required('sdui/ui-sdk/package.json', 'generic UI SDK workspace is missing');
required('sdui/registry/package.json', 'SDUI Registry workspace is missing');
for (const file of sourceFiles('sdui')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/(?:@carbroz\/domain-(?:partner|customer)|domains\/(?:partner|customer)\/)/.test(content)) {
    violations.push(`${toRel(file)}: SDUI must remain product-neutral and cannot depend on Partner/Customer business ownership`);
  }
}

if (violations.length) {
  console.error('[cw3-boundary-gate] CW3 BOUNDED-CONTEXT / DEPENDENCY VERIFICATION FAILED');
  for (const violation of [...new Set(violations)].sort()) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('[cw3-boundary-gate] PASS: Enterprise/Financials, Booking/Operations, Partner/KYC, public-boundary and API/SDUI isolation rules verified read-only');
