import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = (x) => fs.existsSync(p(x));
const mkdir = (x) => fs.mkdirSync(p(x), { recursive: true });
const read = (x) => fs.readFileSync(p(x), 'utf8');
const write = (x, value) => { mkdir(path.dirname(x)); fs.writeFileSync(p(x), value); };
const rm = (x) => fs.rmSync(p(x), { recursive: true, force: true });
const rel = (x) => path.relative(root, x).replaceAll('\\', '/');

const constitution = read('docs/MASTER-BACKEND-CONSTITUTION.md');
for (const marker of ['domains/partner/', 'domains/catalog-pricing/', 'domains/financials/', 'domains/operations/', 'domains/communications/', 'domains/engagement/', 'domains/configuration/', 'domains/enterprise/', 'apps/api', 'GLOBAL', 'PARTNER', 'CUSTOMER']) {
  if (!constitution.includes(marker)) throw new Error(`Constitution gate failed: missing ${marker}`);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(abs)); else out.push(abs);
  }
  return out;
}

// Remove generated output everywhere before source classification.
for (const abs of walk(root)) {
  const r = rel(abs);
  if (r.includes('/dist/') || r.endsWith('.tsbuildinfo')) fs.rmSync(abs, { force: true });
}
for (const dir of walk(root).map((f) => path.dirname(f))) {
  if (path.basename(dir) === 'dist') fs.rmSync(dir, { recursive: true, force: true });
}

const sourceMove = new Map();
function moveFile(oldRel, newRel) {
  const oldAbs = p(oldRel); const newAbs = p(newRel);
  if (!fs.existsSync(oldAbs)) return;
  if (fs.existsSync(newAbs)) {
    sourceMove.set(path.resolve(oldAbs), path.resolve(newAbs));
    fs.rmSync(oldAbs, { force: true });
    return;
  }
  fs.mkdirSync(path.dirname(newAbs), { recursive: true });
  fs.renameSync(oldAbs, newAbs);
  sourceMove.set(path.resolve(oldAbs), path.resolve(newAbs));
}

function moveTree(oldRel, newRel, { skipMeta = false } = {}) {
  const oldAbs = p(oldRel);
  if (!fs.existsSync(oldAbs)) return;
  for (const file of walk(oldAbs)) {
    const sub = path.relative(oldAbs, file).replaceAll('\\', '/');
    if (sub.startsWith('dist/')) continue;
    if (skipMeta && ['package.json','tsconfig.json','README.md','pnpm-lock.yaml'].includes(sub)) continue;
    moveFile(`${oldRel}/${sub}`, `${newRel}/${sub}`);
  }
  rm(oldRel);
}

// Merge transitional bounded-context workspaces into the constitution owners.
const merges = [
  ['domains/partner-profile', 'domains/partner/profile'],
  ['domains/partner-kyc', 'domains/partner/kyc'],
  ['domains/catalog', 'domains/catalog-pricing/catalog'],
  ['domains/pricing', 'domains/catalog-pricing/pricing'],
  ['domains/payment', 'domains/financials/payment'],
  ['domains/invoice', 'domains/financials/invoice'],
  ['domains/payout', 'domains/financials/payout'],
  ['domains/tracking', 'domains/operations/tracking'],
  ['domains/notification', 'domains/communications/notification'],
  ['domains/review', 'domains/engagement/review'],
  ['domains/coupon', 'domains/engagement/coupon'],
];
for (const [from, to] of merges) moveTree(from, to, { skipMeta: true });
moveTree('domains/config', 'domains/configuration', { skipMeta: true });

// Classify the old common package by real ownership.
const commonRules = [
  [/^domain\/(User|UserSession|Role|Permission|RolePermission|AdminUserRole)\.ts$/, 'domains/identity/domain'],
  [/^domain\/repositories\/(IUserRepository|IUserSessionRepository|IRoleRepository|IPermissionRepository|IAdminRoleRepository)\.ts$/, 'domains/identity/domain/repositories'],
  [/^providers\/IAuthorizationProvider\.ts$/, 'domains/identity/application/ports'],

  [/^domain\/(Partner|PartnerMember|PartnerProfile|PartnerType|PartnerStatus|PartnerMemberRole|PartnerMemberStatus|KycDocument|KycDocumentStatus|KycDocumentType)\.ts$/, 'domains/partner/domain'],
  [/^domain\/repositories\/(IPartnerRepository|IPartnerMemberRepository|IPartnerProfileRepository|IKycDocumentRepository)\.ts$/, 'domains/partner/domain/repositories'],

  [/^domain\/(CustomerProfile|Address)\.ts$/, 'domains/customer/profile/domain'],
  [/^domain\/repositories\/(ICustomerProfileRepository|IAddressRepository)\.ts$/, 'domains/customer/profile/domain/repositories'],
  [/^domain\/vehicle\/(.*)$/, 'domains/customer/garage/domain/$1'],

  [/^domain\/(ServiceCategory|Service|ServiceAddon|PricingTier)\.ts$/, 'domains/catalog-pricing/domain'],
  [/^domain\/repositories\/(ICatalogRepository|IPricingRepository)\.ts$/, 'domains/catalog-pricing/domain/repositories'],

  [/^domain\/booking\/(.*)$/, 'domains/booking/domain/$1'],

  [/^domain\/value-objects\/Money\.ts$/, 'domains/financials/domain/value-objects/Money.ts'],
  [/^domain\/config\/FinancialConfiguration\.ts$/, 'domains/financials/domain/config/FinancialConfiguration.ts'],
  [/^domain\/services\/TaxCalculator\.ts$/, 'domains/financials/domain/services/TaxCalculator.ts'],
  [/^domain\/(payment|invoice|payout)\/(.*)$/, 'domains/financials/domain/$1/$2'],
  [/^providers\/IPaymentGatewayProvider\.ts$/, 'domains/financials/application/ports/IPaymentGatewayProvider.ts'],

  [/^domain\/(location)\/(.*)$/, 'domains/operations/domain/$1/$2'],
  [/^domain\/models\/Location\.ts$/, 'domains/operations/domain/location/Location.ts'],
  [/^providers\/IMapsProvider\.ts$/, 'domains/operations/application/ports/IMapsProvider.ts'],

  [/^domain\/notification\/(.*)$/, 'domains/communications/domain/notification/$1'],
  [/^providers\/(IPushProvider|ISmsProvider|IEmailProvider|INotificationProvider)\.ts$/, 'domains/communications/application/ports/$1.ts'],

  [/^domain\/(review|coupon|events)\/(.*)$/, 'domains/engagement/domain/$1/$2'],
  [/^domain\/audit\/(.*)$/, 'domains/audit/domain/$1'],
  [/^domain\/dispute\/(.*)$/, 'domains/dispute/domain/$1'],
  [/^domain\/corporate\/(.*)$/, 'domains/enterprise/domain/corporate/$1'],

  [/^domain\/(SystemConfig|FeatureFlag)\.ts$/, 'domains/configuration/domain'],
  [/^domain\/repositories\/(IConfigRepository|IFeatureFlagRepository)\.ts$/, 'domains/configuration/domain/repositories'],
  [/^providers\/IFeatureFlagProvider\.ts$/, 'domains/configuration/application/ports/IFeatureFlagProvider.ts'],

  [/^application\/(IUseCase|IRequestContext)\.ts$/, 'foundation/kernel/src/application'],
  [/^domain\/(IEntity|IAggregateRoot|IDomainEvent|IReadRepository|IWriteRepository|IRepository)\.ts$/, 'foundation/kernel/src/domain'],
  [/^providers\/(IProvider|IClockProvider|IIdGeneratorProvider|ITransactionProvider|ILoggerProvider|IConfigProvider)\.ts$/, 'foundation/kernel/src/application/ports/$1.ts'],
  [/^providers\/ICacheProvider\.ts$/, 'platform/cache/src/public/ICacheProvider.ts'],
  [/^providers\/IDatabaseProvider\.ts$/, 'platform/database/src/public/IDatabaseProvider.ts'],
  [/^providers\/IStorageProvider\.ts$/, 'platform/storage/src/public/IStorageProvider.ts'],
  [/^errors\/(.*)$/, 'foundation/kernel/src/errors/$1'],
  [/^exceptions\.ts$/, 'foundation/kernel/src/errors/exceptions.ts'],
  [/^shared\/(IBuilder|IFactory)\.ts$/, 'foundation/kernel/src/application/$1.ts'],
  [/^constants\.ts$/, 'foundation/kernel/src/constants.ts'],
  [/^responses\.ts$/, 'apps/api/src/transport/response/ResponseHelper.ts'],
];

const commonRoot = p('packages/common/src');
if (fs.existsSync(commonRoot)) {
  for (const file of walk(commonRoot)) {
    const sub = path.relative(commonRoot, file).replaceAll('\\', '/');
    if (sub === 'index.ts') continue;
    let target = null;
    for (const [rx, dest] of commonRules) {
      const m = sub.match(rx);
      if (!m) continue;
      target = dest.replace(/\$(\d+)/g, (_, n) => m[Number(n)] ?? '');
      if (!path.extname(target)) target = `${target}/${path.basename(sub)}`;
      break;
    }
    if (!target) throw new Error(`Unclassified @carbroz/common source: ${sub}`);
    moveFile(`packages/common/src/${sub}`, target);
  }
}

// Move API business use cases to their owning bounded contexts.
const moduleOwners = {
  auth: 'domains/identity/application',
  partner: 'domains/partner/application/self-service',
  customer: 'domains/customer/application/self-service',
  catalog: 'domains/catalog-pricing/application',
  booking: 'domains/booking/application',
  payment: 'domains/financials/application/payment',
  invoice: 'domains/financials/application/invoice',
  payout: 'domains/financials/application/payout',
  tracking: 'domains/operations/application/tracking',
  maps: 'domains/operations/application/maps',
  notification: 'domains/communications/application',
  review: 'domains/engagement/application/review',
  coupon: 'domains/engagement/application/coupon',
  dispute: 'domains/dispute/application',
  corporate: 'domains/enterprise/application',
  config: 'domains/configuration/application',
  vehicle: 'domains/customer/garage/application',
  sdui: 'sdui/registry/application',
};
for (const [mod, owner] of Object.entries(moduleOwners)) {
  const uc = `apps/api/src/modules/${mod}/use-cases`;
  if (exists(uc)) moveTree(uc, owner);
}

// Admin business use cases are classified by the capability they mutate.
const adminUseCases = p('apps/api/src/modules/admin/use-cases');
if (fs.existsSync(adminUseCases)) {
  for (const file of walk(adminUseCases)) {
    const name = path.basename(file);
    let owner;
    if (/Kyc|Partner|Training/i.test(name)) owner = 'domains/partner/application/administration';
    else if (/Customer/i.test(name)) owner = 'domains/customer/application/administration';
    else if (/Booking/i.test(name)) owner = 'domains/booking/application/administration';
    else if (/Catalog|Pricing/i.test(name)) owner = 'domains/catalog-pricing/application/administration';
    else if (/Payment|Invoice|Payout|Refund/i.test(name)) owner = 'domains/financials/application/administration';
    else if (/Dispute/i.test(name)) owner = 'domains/dispute/application/administration';
    else if (/Sdui/i.test(name)) owner = 'sdui/registry/application/administration';
    else throw new Error(`Unclassified admin use case ${name}`);
    moveFile(rel(file), `${owner}/${name}`);
  }
  rm('apps/api/src/modules/admin/use-cases');
}

// Partner status mutation is administration, not partner self-service.
for (const name of ['VerifyPartnerUseCase.ts']) {
  const from = `domains/partner/application/self-service/${name}`;
  if (exists(from)) moveFile(from, `domains/partner/application/administration/${name}`);
}

// Isolate transport surfaces. Keep each surface's transport contract physically independent.
function moveApiDir(from, to) { if (exists(from)) moveTree(from, to); }
moveApiDir('apps/api/src/modules/partner/api', 'apps/api/src/surfaces/partner');
moveApiDir('apps/api/src/modules/partner/dtos', 'apps/api/src/surfaces/partner/dto');
moveApiDir('apps/api/src/modules/customer/api', 'apps/api/src/surfaces/customer');
moveApiDir('apps/api/src/modules/customer/dtos', 'apps/api/src/surfaces/customer/dto');
moveApiDir('apps/api/src/modules/admin/api', 'apps/api/src/surfaces/admin');
moveApiDir('apps/api/src/modules/admin/dtos', 'apps/api/src/surfaces/admin/dto');

// Remaining capability transport is classified by its currently exposed actor; generic/system transport stays transport-only.
const customerTransport = ['catalog','review','coupon','dispute','corporate','vehicle','payment','booking'];
for (const mod of customerTransport) {
  moveApiDir(`apps/api/src/modules/${mod}/api`, `apps/api/src/surfaces/customer/${mod}`);
  moveApiDir(`apps/api/src/modules/${mod}/controllers`, `apps/api/src/surfaces/customer/${mod}/controllers`);
  moveApiDir(`apps/api/src/modules/${mod}/routes`, `apps/api/src/surfaces/customer/${mod}/routes`);
  moveApiDir(`apps/api/src/modules/${mod}/dtos`, `apps/api/src/surfaces/customer/${mod}/dto`);
}
moveApiDir('apps/api/src/modules/sdui/api', 'apps/api/src/surfaces/admin/sdui');
moveApiDir('apps/api/src/modules/config/api', 'apps/api/src/transport/config');
moveApiDir('apps/api/src/modules/auth/api', 'apps/api/src/transport/auth');
moveApiDir('apps/api/src/modules/maps/api', 'apps/api/src/transport/maps');
moveApiDir('apps/api/src/modules/health/api', 'apps/api/src/system/health');
moveApiDir('apps/api/src/modules/notification/api', 'apps/api/src/transport/notification');
moveApiDir('apps/api/src/modules/tracking/api', 'apps/api/src/transport/tracking');
moveApiDir('apps/api/src/modules/invoice/api', 'apps/api/src/transport/invoice');
moveApiDir('apps/api/src/modules/payout/api', 'apps/api/src/surfaces/partner/payout');

// Move API composition/runtime files into the canonical bootstrap/transport shape.
for (const [from, to] of [
  ['apps/api/src/app.ts','apps/api/src/bootstrap/app.ts'],
  ['apps/api/src/server.ts','apps/api/src/bootstrap/server.ts'],
  ['apps/api/src/app.routes.ts','apps/api/src/bootstrap/app.routes.ts'],
]) if (exists(from)) moveFile(from, to);
moveApiDir('apps/api/src/container', 'apps/api/src/bootstrap/container');
moveApiDir('apps/api/src/plugins', 'apps/api/src/bootstrap/plugins');
moveApiDir('apps/api/src/middlewares', 'apps/api/src/transport/middleware');
moveApiDir('apps/api/src/controllers', 'apps/api/src/transport/controllers');
moveApiDir('apps/api/src/providers', 'apps/api/src/bootstrap/providers');

// Remove any now-empty legacy API module tree. No business use cases may remain under apps/api.
rm('apps/api/src/modules');

// Platform consolidation: technology only.
moveTree('platform/event-bus', 'platform/messaging/event-bus', { skipMeta: true });
moveTree('platform/queue', 'platform/messaging/queue', { skipMeta: true });
moveTree('platform/notification', 'platform/integrations/notification', { skipMeta: true });
moveTree('platform/feature-flags', 'platform/integrations/feature-flags', { skipMeta: true });
moveTree('platform/testing', 'tests/support/platform', { skipMeta: true });

// Retire duplicate legacy roots after source classification.
rm('packages/common');
rm('packages/config');
rm('shared');

// Rewrite relative imports for files that were physically moved.
function resolveTsImport(oldFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(oldFile), spec);
  const candidates = [base, base.replace(/\.js$/, '.ts'), `${base}.ts`, path.join(base, 'index.ts')];
  return candidates.find((x) => sourceMove.has(x) || fs.existsSync(x)) ?? null;
}
function toJsRelative(fromFile, toFile) {
  let r = path.relative(path.dirname(fromFile), toFile).replaceAll('\\', '/').replace(/\.ts$/, '.js');
  if (!r.startsWith('.')) r = `./${r}`;
  return r;
}
for (const [oldAbs, newAbs] of sourceMove.entries()) {
  if (!fs.existsSync(newAbs) || !newAbs.endsWith('.ts')) continue;
  let text = fs.readFileSync(newAbs, 'utf8');
  text = text.replace(/(from\s+['"])(\.[^'"]+)(['"])/g, (all, a, spec, z) => {
    const oldTarget = resolveTsImport(oldAbs, spec);
    if (!oldTarget) return all;
    const mapped = sourceMove.get(oldTarget) ?? oldTarget;
    if (!fs.existsSync(mapped)) return all;
    return `${a}${toJsRelative(newAbs, mapped)}${z}`;
  });
  fs.writeFileSync(newAbs, text);
}

// Canonical old-package -> owner package map.
const packageMap = new Map([
  ['@carbroz/domain-partner-profile','@carbroz/domain-partner'],
  ['@carbroz/domain-partner-kyc','@carbroz/domain-partner'],
  ['@carbroz/domain-catalog','@carbroz/domain-catalog-pricing'],
  ['@carbroz/domain-pricing','@carbroz/domain-catalog-pricing'],
  ['@carbroz/domain-payment','@carbroz/domain-financials'],
  ['@carbroz/domain-invoice','@carbroz/domain-financials'],
  ['@carbroz/domain-payout','@carbroz/domain-financials'],
  ['@carbroz/domain-tracking','@carbroz/domain-operations'],
  ['@carbroz/domain-notification','@carbroz/domain-communications'],
  ['@carbroz/domain-review','@carbroz/domain-engagement'],
  ['@carbroz/domain-coupon','@carbroz/domain-engagement'],
  ['@carbroz/domain-config','@carbroz/domain-configuration'],
  ['@carbroz/domain-garage','@carbroz/domain-customer'],
  ['@carbroz/domain-sdui-registry','@carbroz/sdui-registry'],
]);

// Build symbol ownership from declaration files that originated in common.
const ownerByPath = [
  ['domains/identity/','@carbroz/domain-identity'], ['domains/partner/','@carbroz/domain-partner'],
  ['domains/customer/','@carbroz/domain-customer'], ['domains/catalog-pricing/','@carbroz/domain-catalog-pricing'],
  ['domains/booking/','@carbroz/domain-booking'], ['domains/operations/','@carbroz/domain-operations'],
  ['domains/financials/','@carbroz/domain-financials'], ['domains/communications/','@carbroz/domain-communications'],
  ['domains/engagement/','@carbroz/domain-engagement'], ['domains/configuration/','@carbroz/domain-configuration'],
  ['domains/dispute/','@carbroz/domain-dispute'], ['domains/enterprise/','@carbroz/domain-enterprise'],
  ['domains/audit/','@carbroz/domain-audit'], ['foundation/kernel/','@carbroz/foundation-kernel'],
  ['platform/cache/','@carbroz/platform-cache'], ['platform/database/','@carbroz/platform-database'],
  ['platform/storage/','@carbroz/platform-storage'], ['apps/api/','@carbroz/api'],
];
const symbolOwner = new Map();
for (const [, newAbs] of sourceMove.entries()) {
  const r = rel(newAbs);
  const owner = ownerByPath.find(([prefix]) => r.startsWith(prefix))?.[1];
  if (!owner || !newAbs.endsWith('.ts')) continue;
  const text = fs.readFileSync(newAbs, 'utf8');
  for (const m of text.matchAll(/export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|interface|enum|type|const|function)\s+([A-Za-z_$][\w$]*)/g)) symbolOwner.set(m[1], owner);
}
// Common aliases known to be exported without a declaration match.
symbolOwner.set('ResponseHelper', '@carbroz/api');

function rewriteCommonImports(file, text) {
  return text.replace(/import\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+['"]@carbroz\/common['"];?/g, (all, typeOnly, body) => {
    const tokens = body.split(',').map((x) => x.trim()).filter(Boolean);
    const groups = new Map();
    for (const token of tokens) {
      const cleaned = token.replace(/^type\s+/, '').trim();
      const original = cleaned.split(/\s+as\s+/)[0].trim();
      const owner = symbolOwner.get(original);
      if (!owner) throw new Error(`No canonical owner for @carbroz/common symbol ${original} in ${rel(file)}`);
      if (owner === '@carbroz/api' && rel(file).startsWith('apps/api/')) {
        // ResponseHelper is transport-only and rewritten separately below.
        continue;
      }
      const arr = groups.get(owner) ?? []; arr.push(token); groups.set(owner, arr);
    }
    return [...groups.entries()].map(([owner, names]) => `import ${typeOnly ?? ''}{ ${names.join(', ')} } from '${owner}';`).join('\n');
  });
}

for (const file of walk(root).filter((x) => x.endsWith('.ts'))) {
  let text = fs.readFileSync(file, 'utf8');
  for (const [from, to] of packageMap.entries()) text = text.replaceAll(`'${from}'`, `'${to}'`).replaceAll(`"${from}"`, `"${to}"`);
  if (text.includes('@carbroz/common')) text = rewriteCommonImports(file, text);
  // API-only ResponseHelper import points to canonical transport helper.
  if (rel(file).startsWith('apps/api/') && /\bResponseHelper\b/.test(text) && !text.includes("ResponseHelper.js'")) {
    const helper = p('apps/api/src/transport/response/ResponseHelper.ts');
    if (fs.existsSync(helper)) {
      const spec = toJsRelative(file, helper);
      text = `import { ResponseHelper } from '${spec}';\n${text}`;
    }
  }
  fs.writeFileSync(file, text);
}

// Normalize API paths after moving app/bootstrap files.
for (const file of walk(p('apps/api/src')).filter((x) => x.endsWith('.ts'))) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replaceAll("../modules/", "../../surfaces/").replaceAll("./modules/", "../surfaces/");
  fs.writeFileSync(file, text);
}

const canonical = {
  identity: '@carbroz/domain-identity', partner: '@carbroz/domain-partner', customer: '@carbroz/domain-customer',
  'catalog-pricing': '@carbroz/domain-catalog-pricing', booking: '@carbroz/domain-booking', operations: '@carbroz/domain-operations',
  financials: '@carbroz/domain-financials', communications: '@carbroz/domain-communications', engagement: '@carbroz/domain-engagement',
  configuration: '@carbroz/domain-configuration', dispute: '@carbroz/domain-dispute', enterprise: '@carbroz/domain-enterprise', audit: '@carbroz/domain-audit'
};

function exportableFiles(dir) {
  return walk(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.includes('/tests/') && !f.includes('/dist/') && !f.includes('/infrastructure/'));
}
function generatePublic(domain, packageName) {
  const base = p('domains', domain);
  mkdir(`domains/${domain}/public`);
  const pub = p('domains', domain, 'public/index.ts');
  const candidates = exportableFiles(base).filter((f) => f !== pub && !f.endsWith('/public/index.ts') && !f.endsWith('/module.manifest.ts'));
  const lines = [];
  for (const f of candidates) {
    const r = toJsRelative(pub, f);
    lines.push(`export * from '${r}';`);
  }
  fs.writeFileSync(pub, [...new Set(lines)].sort().join('\n') + '\n');
  write(`domains/${domain}/package.json`, JSON.stringify({ name: packageName, version: '1.0.0', type: 'module', main: 'dist/public/index.js', types: 'dist/public/index.d.ts', scripts: { build: 'tsc' }, dependencies: { awilix: '^12.0.0', '@prisma/client': '^6.19.3' }, devDependencies: { '@types/node': '^26.1.0' } }, null, 2) + '\n');
  write(`domains/${domain}/tsconfig.json`, JSON.stringify({ extends: '../../tsconfig.json', compilerOptions: { rootDir: '.', outDir: 'dist', types: ['node'] }, include: ['**/*.ts'], exclude: ['dist','node_modules','tests'] }, null, 2) + '\n');
}
for (const [domain, pkg] of Object.entries(canonical)) generatePublic(domain, pkg);

// SDUI and platform/foundation keep their canonical packages; remove generated output only.
// Final workspace roots are constitution-exact.
write('pnpm-workspace.yaml', `packages:\n  - 'apps/*'\n  - 'domains/*'\n  - 'sdui/*'\n  - 'platform/*'\n  - 'foundation/*'\n`);

// Rewrite internal dependency names in package manifests and add imports discovered from source.
const workspaces = ['apps/api', ...Object.keys(canonical).map((d) => `domains/${d}`), 'sdui/ui-sdk','sdui/registry','platform/database','platform/cache','platform/messaging','platform/storage','platform/observability','platform/integrations','foundation/kernel'];
const packageRootByName = new Map();
for (const ws of workspaces) {
  const pj = p(ws, 'package.json'); if (!fs.existsSync(pj)) continue;
  try { const j = JSON.parse(fs.readFileSync(pj,'utf8')); if (j.name) packageRootByName.set(j.name, ws); } catch {}
}
for (const ws of workspaces) {
  const pj = p(ws, 'package.json'); if (!fs.existsSync(pj)) continue;
  let j; try { j = JSON.parse(fs.readFileSync(pj,'utf8')); } catch { continue; }
  const deps = { ...(j.dependencies ?? {}) };
  for (const [oldName,newName] of packageMap.entries()) { if (deps[oldName]) { delete deps[oldName]; deps[newName] = 'workspace:*'; } }
  delete deps['@carbroz/common']; delete deps['@carbroz/config'];
  for (const file of walk(p(ws)).filter((x) => x.endsWith('.ts'))) {
    const text = fs.readFileSync(file,'utf8');
    for (const m of text.matchAll(/from\s+['"](@carbroz\/[^'"]+)['"]/g)) {
      const name = m[1]; if (name !== j.name && packageRootByName.has(name)) deps[name] = 'workspace:*';
    }
  }
  j.dependencies = deps;
  fs.writeFileSync(pj, JSON.stringify(j,null,2)+'\n');
}

// Update ignore policy.
let gi = exists('.gitignore') ? read('.gitignore') : '';
for (const line of ['dist/','**/dist/','*.tsbuildinfo','coverage/']) if (!gi.split(/\r?\n/).includes(line)) gi += `\n${line}`;
write('.gitignore', gi.replace(/^\n+/,'').trimEnd()+'\n');

// Hard architecture verification before allowing the workflow to build/commit.
const forbiddenRoots = ['packages','shared','libs','common'];
for (const f of forbiddenRoots) if (exists(f)) throw new Error(`Forbidden root remains: ${f}`);
for (const d of Object.keys(canonical)) if (!exists(`domains/${d}`)) throw new Error(`Missing canonical domain: ${d}`);
for (const old of ['partner-profile','partner-kyc','catalog','pricing','payment','invoice','payout','tracking','notification','review','coupon','config']) if (exists(`domains/${old}`)) throw new Error(`Transitional domain remains: ${old}`);
for (const f of walk(root)) if (rel(f).includes('/dist/')) throw new Error(`Tracked/generated dist remains: ${rel(f)}`);
for (const f of walk(p('apps/api/src')).filter((x) => x.endsWith('.ts'))) {
  if (rel(f).includes('/use-cases/')) throw new Error(`Business use case remains in apps/api: ${rel(f)}`);
}
for (const f of walk(root).filter((x) => x.endsWith('.ts'))) {
  const text = fs.readFileSync(f,'utf8');
  if (text.includes('@carbroz/common')) throw new Error(`Legacy common import remains: ${rel(f)}`);
  if (text.includes('@carbroz/config')) throw new Error(`Legacy config import remains: ${rel(f)}`);
}
console.log('Backend V3 canonical migration generated successfully.');
