import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiRoot = path.join(root, 'apps/api/src');
const exists = fs.existsSync;
const read = (f) => fs.readFileSync(f, 'utf8');
const write = (f, c) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c.endsWith('\n') ? c : `${c}\n`); };
const walk = (dir) => exists(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const f = path.join(dir, e.name); return e.isDirectory() ? walk(f) : [f];
}) : [];
const resolveTs = (fromFile, spec) => {
  const raw = path.resolve(path.dirname(fromFile), spec);
  return [raw, raw.replace(/\.js$/, '.ts'), `${raw}.ts`, path.join(raw, 'index.ts')].find(exists);
};

const workspaceRoots = [];
for (const base of ['domains','platform','sdui','foundation']) {
  const dir = path.join(root, base); if (!exists(dir)) continue;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const pkgRoot = path.join(dir, e.name);
    const manifest = path.join(pkgRoot, 'package.json');
    if (!exists(manifest)) continue;
    const name = JSON.parse(read(manifest)).name;
    if (name) workspaceRoots.push({ root: pkgRoot, name });
  }
}
workspaceRoots.sort((a,b) => b.root.length - a.root.length);
const ownerFor = (file) => workspaceRoots.find(w => file === w.root || file.startsWith(`${w.root}${path.sep}`));

// Composition-facing concrete platform adapters must be available through their package boundary.
const integrationsIndex = path.join(root, 'platform/integrations/index.ts');
if (exists(integrationsIndex)) {
  let c = read(integrationsIndex);
  for (const rel of [
    './src/maps/GoogleMapsProvider.js',
    './src/payment/RazorpayPaymentGatewayProvider.js',
    './src/communications/FirebasePushProvider.js',
    './src/communications/Msg91SmsProvider.js',
    './src/communications/ResendEmailProvider.js',
  ]) {
    const line = `export * from '${rel}';`;
    if (exists(path.join(root, 'platform/integrations', rel.replace('./','').replace(/\.js$/, '.ts'))) && !c.includes(line)) c += `${c.endsWith('\n')?'':'\n'}${line}\n`;
  }
  write(integrationsIndex, c);
}
const observabilityIndex = path.join(root, 'platform/observability/src/index.ts');
if (exists(observabilityIndex) && exists(path.join(root,'platform/observability/src/adapters/LoggerProvider.ts'))) {
  let c = read(observabilityIndex); const line = "export * from './adapters/LoggerProvider.js';";
  if (!c.includes(line)) c += `${c.endsWith('\n')?'':'\n'}${line}\n`; write(observabilityIndex,c);
}
const identityPublic = path.join(root,'domains/identity/public/index.ts');
if (exists(identityPublic) && exists(path.join(root,'domains/identity/infrastructure/authorization/AuthorizationProvider.ts'))) {
  let c=read(identityPublic); const line="export * from '../infrastructure/authorization/AuthorizationProvider.js';";
  if(!c.includes(line)) c+=`${c.endsWith('\n')?'':'\n'}${line}\n`; write(identityPublic,c);
}

// Rewrite every API relative import that resolves into another workspace to that workspace's public package name.
for (const file of walk(apiRoot).filter(f => f.endsWith('.ts'))) {
  let c = read(file);
  c = c.replace(/(from\s+['"])(\.\.?\/[^'"]+)(['"])/g, (all, pre, spec, post) => {
    const target = resolveTs(file, spec); if (!target) return all;
    const owner = ownerFor(target); if (!owner) return all;
    return `${pre}${owner.name}${post}`;
  });
  write(file,c);
}

// Canonical tracking authority already existed before API evacuation. Keep old DI keys through aliases only.
const container = path.join(apiRoot,'bootstrap/container/index.ts');
if (exists(container)) {
  let c = read(container);
  c = c
    .replace(/^import \{ StartTrackingSessionUseCase \} from ['"][^'"]+['"];\s*$/m, "import { StartTrackingSessionUseCase, UpdateLiveGpsLocationUseCase as UpdateLocationPingUseCase, GetLiveTrackingTimelineUseCase as GetCurrentTrackingUseCase, CompleteTrackingSessionUseCase as EndTrackingSessionUseCase } from '@carbroz/domain-operations';")
    .replace(/^import \{ UpdateLocationPingUseCase \} from ['"][^'"]+['"];\s*$/m, '')
    .replace(/^import \{ GetCurrentTrackingUseCase \} from ['"][^'"]+['"];\s*$/m, '')
    .replace(/^import \{ EndTrackingSessionUseCase \} from ['"][^'"]+['"];\s*$/m, '')
    .replace(/^import \{ AssignPartnerToBookingUseCase \} from ['"][^'"]+['"];\s*$/m, '')
    .replace(/^import \{ BookingController \} from ['"][^'"]+['"];\s*$/m, '')
    .replace(/^import \{ PaymentController \} from ['"][^'"]+['"];\s*$/m, '')
    .replace(/^import \{ PayoutController \} from ['"][^'"]+['"];\s*$/m, '')
    .replace(/^\s*assignPartnerToBookingUseCase:\s*AssignPartnerToBookingUseCase;\s*$/gm, '')
    .replace(/^\s*bookingController:\s*BookingController;\s*$/gm, '')
    .replace(/^\s*paymentController:\s*PaymentController;\s*$/gm, '')
    .replace(/^\s*payoutController:\s*PayoutController;\s*$/gm, '')
    .replace(/^\s*assignPartnerToBookingUseCase:\s*asClass\([^\n]+\),?\s*$/gm, '')
    .replace(/^\s*bookingController:\s*asClass\([^\n]+\),?\s*$/gm, '')
    .replace(/^\s*paymentController:\s*asClass\([^\n]+\),?\s*$/gm, '')
    .replace(/^\s*payoutController:\s*asClass\([^\n]+\),?\s*$/gm, '');
  write(container,c);
}

// Fastify/JWT metadata is adapted once at the transport edge. No IRequestContext survives in API.
for (const file of walk(apiRoot).filter(f => f.endsWith('.ts'))) {
  let c = read(file);
  if (!/\bIRequestContext\b/.test(c)) continue;
  c = c.replace(/import\s+(?:type\s+)?\{\s*IRequestContext\s*\}\s+from\s+['"][^'"]+['"];?\s*/g, '');
  c = c.replace(/\bIRequestContext\b/g, 'ExecutionContext');
  // Common legacy request-context object shapes used by Partner/KYC/Maps controllers.
  c = c.replace(/const context = \{[\s\S]*?authenticatedUser:\s*request\.user\s+as\s+any[\s\S]*?\}\s+as\s+ExecutionContext;/g, 'const context = toExecutionContext(request);');
  if (c.includes('toExecutionContext(request)') && !c.includes("from '../../../context/toExecutionContext.js'") && !c.includes("from '../../context/toExecutionContext.js'") && !c.includes("from '../context/toExecutionContext.js'")) {
    let rel = path.relative(path.dirname(file), path.join(apiRoot,'context/toExecutionContext.ts')).replaceAll('\\','/').replace(/\.ts$/,'.js');
    if (!rel.startsWith('.')) rel=`./${rel}`;
    c = `import { toExecutionContext } from '${rel}';\n${c}`;
  }
  write(file,c);
}

// Old API auth-domain artifacts were deleted by design. JWT/RBAC transport must consume Identity/Foundation public contracts.
for (const file of walk(apiRoot).filter(f => f.endsWith('.ts'))) {
  let c=read(file);
  c=c.replace(/from\s+['"][^'"]*modules\/auth\/infrastructure\/jwt\.service\.interface\.js['"]/g, "from '@carbroz/domain-identity'");
  c=c.replace(/from\s+['"][^'"]*modules\/auth\/domain\/rbac\.js['"]/g, "from '@carbroz/domain-identity'");
  c=c.replace(/from\s+['"][^'"]*domain\/rbac\.js['"]/g, "from '@carbroz/domain-identity'");
  write(file,c);
}

// Partner status is a domain enum, never a free transport string.
for (const file of walk(path.join(apiRoot,'surfaces/admin')).filter(f=>f.endsWith('.ts'))) {
  let c=read(file);
  if (c.includes("'ACTIVE' | 'SUSPENDED' | 'REJECTED'")) c=c.replace(/'ACTIVE' \| 'SUSPENDED' \| 'REJECTED'/g, 'PartnerStatus');
  if (c.includes('PartnerStatus') && !c.includes("@carbroz/domain-partner")) c=`import { PartnerStatus } from '@carbroz/domain-partner';\n${c}`;
  write(file,c);
}

// Remove known stale imports whose transport controllers were intentionally removed during topology convergence.
for (const file of walk(apiRoot).filter(f=>f.endsWith('.ts'))) {
  let c=read(file);
  c=c.replace(/^import[^\n]+from ['"][^'"]*modules\/(?:booking|payment|payout)\/api\/[^'"]+['"];\s*$/gm,'');
  write(file,c);
}

const violations=[];
for (const file of walk(apiRoot).filter(f=>f.endsWith('.ts'))) {
  const c=read(file);
  if (/\bIRequestContext\b/.test(c)) violations.push(`${path.relative(root,file)} retains IRequestContext`);
  if (/apps\/api\/src\/modules|\/modules\//.test(c)) violations.push(`${path.relative(root,file)} references legacy modules`);
  for (const m of c.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    const target=resolveTs(file,m[1]);
    if (target && !target.startsWith(`${apiRoot}${path.sep}`)) violations.push(`${path.relative(root,file)} imports workspace source ${m[1]}`);
  }
}
if (violations.length) throw new Error(`API closeout boundary failed:\n${[...new Set(violations)].map(v=>`- ${v}`).join('\n')}`);
console.log('[architecture-closeout-api] API imports public workspace boundaries and retains transport/composition ownership only');
