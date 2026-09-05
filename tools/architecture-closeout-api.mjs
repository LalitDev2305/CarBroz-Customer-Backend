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
const ensureNamedImport = (content, packageName, symbol) => {
  const escaped = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s+from\\s+['\"]${escaped}['\"];?`);
  const match = content.match(pattern);
  if (!match) return `import { ${symbol} } from '${packageName}';\n${content}`;
  const names = match[1].split(',').map((part) => part.trim()).filter(Boolean);
  if (names.some((name) => name.split(/\s+as\s+/)[0] === symbol)) return content;
  const next = [...names, symbol].join(', ');
  return content.replace(pattern, `import { ${next} } from '${packageName}';`);
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
  c = c.replace(/const context = \{[\s\S]*?authenticatedUser:\s*request\.user\s+as\s+any[\s\S]*?\}\s+as\s+ExecutionContext;/g, 'const context = toExecutionContext(request);');
  if (c.includes('toExecutionContext(request)') && !c.includes('toExecutionContext.js')) {
    let rel = path.relative(path.dirname(file), path.join(apiRoot,'context/toExecutionContext.ts')).replaceAll('\\','/').replace(/\.ts$/,'.js');
    if (!rel.startsWith('.')) rel=`./${rel}`;
    c = `import { toExecutionContext } from '${rel}';\n${c}`;
  }
  write(file,c);
}

// Deleted auth internals are normalized first. Transport-only JWT claims and guard policy are then
// deliberately reclassified back into API transport below; Identity remains the business authority.
for (const file of walk(apiRoot).filter(f => f.endsWith('.ts'))) {
  let c = read(file);
  c = c
    .replace(/from\s+['"][^'"]*modules\/auth\/infrastructure\/jwt\.service\.interface\.js['"]/g, "from '@carbroz/domain-identity'")
    .replace(/from\s+['"][^'"]*modules\/auth\/domain\/rbac\.js['"]/g, "from '@carbroz/domain-identity'")
    .replace(/from\s+['"][^'"]*domain\/rbac\.js['"]/g, "from '@carbroz/domain-identity'");
  write(file, c);
}

// JwtPayload describes @fastify/jwt transport claims and remains transport-local rather than becoming an Identity domain type.
const jwtPlugin = path.join(apiRoot, 'bootstrap/plugins/jwt.plugin.ts');
if (exists(jwtPlugin)) {
  let c = read(jwtPlugin);
  c = c.replace(/^import\s+\{\s*JwtPayload\s*\}\s+from\s+['"][^'"]+['"];?\s*$/m, '');
  if (!c.includes('interface JwtPayload {')) {
    const marker = "import { JwtConfig } from '../config/runtime-config.js';";
    const typeDef = `\n\ninterface JwtPayload {\n  sub?: string;\n  id: string;\n  phone: string;\n  roles: string[];\n  iat?: number;\n  exp?: number;\n  iss?: string;\n  aud?: string;\n}`;
    if (!c.includes(marker)) throw new Error('JWT transport config import marker not found');
    c = c.replace(marker, `${marker}${typeDef}`);
  }
  write(jwtPlugin, c);
}

// Route guard role/permission constants are HTTP authorization policy, not persistent Identity entities.
const transportRbac = path.join(apiRoot, 'transport/auth/rbac.ts');
write(transportRbac, `export enum AppRole {\n  CUSTOMER = 'CUSTOMER',\n  PARTNER = 'PARTNER',\n  ADMIN = 'ADMIN',\n}\n\nexport enum AppPermission {\n  USER_READ = 'USER_READ',\n  USER_WRITE = 'USER_WRITE',\n  BOOKING_READ = 'BOOKING_READ',\n  BOOKING_CREATE = 'BOOKING_CREATE',\n  SYSTEM_ADMIN = 'SYSTEM_ADMIN',\n}\n\nexport const RolePermissions: Readonly<Record<AppRole, readonly AppPermission[]>> = {\n  [AppRole.CUSTOMER]: [AppPermission.USER_READ, AppPermission.BOOKING_READ, AppPermission.BOOKING_CREATE],\n  [AppRole.PARTNER]: [AppPermission.USER_READ, AppPermission.USER_WRITE, AppPermission.BOOKING_READ],\n  [AppRole.ADMIN]: [AppPermission.SYSTEM_ADMIN],\n};\n`);
for (const file of walk(apiRoot).filter(f => f.endsWith('.ts') && f !== transportRbac)) {
  let c = read(file);
  if (!/\b(?:AppRole|AppPermission|RolePermissions)\b/.test(c)) continue;
  c = c.replace(/^import\s+\{[^\n]*(?:AppRole|AppPermission|RolePermissions)[^\n]*\}\s+from\s+['"]@carbroz\/domain-identity['"];?\s*$/m, (line) => {
    const names = ['AppRole','AppPermission','RolePermissions'].filter(name => line.includes(name));
    let rel = path.relative(path.dirname(file), transportRbac).replaceAll('\\','/').replace(/\.ts$/,'.js');
    if (!rel.startsWith('.')) rel=`./${rel}`;
    return `import { ${names.join(', ')} } from '${rel}';`;
  });
  write(file,c);
}

// JWT claim ids are strings at the transport boundary. Convert explicitly where application inputs require numeric actor ids.
for (const file of walk(path.join(apiRoot, 'surfaces')).filter(f => f.endsWith('.ts'))) {
  let c = read(file);
  c = c.replace(/\(request\.user\s+as\s+\{\s*id:\s*number;?\s*\}\)\.id/g, 'Number(request.user.id)');
  write(file, c);
}

// Partner status is a domain enum; transport schema strings are explicitly converted at the boundary.
const adminPartner = path.join(apiRoot,'surfaces/admin/controllers/admin-partner.controller.ts');
if (exists(adminPartner)) {
  let c=read(adminPartner);
  c=ensureNamedImport(c, '@carbroz/domain-partner', 'PartnerStatus');
  c=c.replace(/status:\s*input\.status(?!\s+as\s+PartnerStatus)/g, 'status: input.status as PartnerStatus');
  write(adminPartner,c);
}

// Dispute transport is split by authority. Customer may create a dispute, but global listing and
// resolution are Admin-only. We intentionally do not expose an unscoped Customer list endpoint.
const customerDispute = path.join(apiRoot,'surfaces/customer/routes/dispute.routes.ts');
if (exists(customerDispute)) {
  write(customerDispute, `import type { FastifyInstance } from 'fastify';\nimport { RaiseDisputeUseCase } from '@carbroz/domain-dispute';\nimport { ResponseHelper } from '../../../transport/response/ResponseHelper.js';\nimport { raiseDisputeSchema } from '../dto/dispute.dto.js';\n\n/** Customer-owned dispute creation endpoint. */\nexport async function registerCustomerDisputeRoutes(app: FastifyInstance): Promise<void> {\n  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {\n    const input = raiseDisputeSchema.parse(request.body);\n    const user = request.user as { id: string | number; roles?: string[]; role?: string };\n    const roles = user.roles ?? (user.role ? [user.role] : []);\n    const actorType: 'CUSTOMER' | 'PARTNER' = roles.includes('PARTNER') ? 'PARTNER' : 'CUSTOMER';\n    const uc = app.diContainer.resolve<RaiseDisputeUseCase>('raiseDisputeUseCase');\n    const dispute = await uc.execute({\n      bookingPublicId: input.bookingPublicId,\n      actorId: Number(user.id),\n      actorType,\n      disputeReason: input.disputeReason,\n      description: input.description,\n      requestedRefundPaise: input.requestedRefundPaise,\n    });\n    return reply.status(201).send(ResponseHelper.created(dispute, 'Dispute raised successfully'));\n  });\n}\n`);
}
const adminDispute = path.join(apiRoot,'surfaces/admin/routes/dispute.routes.ts');
if (exists(adminDispute)) {
  write(adminDispute, `import type { FastifyInstance } from 'fastify';\nimport { DisputeStatus, ListDisputesUseCase, ResolveDisputeUseCase } from '@carbroz/domain-dispute';\nimport { ResponseHelper } from '../../../transport/response/ResponseHelper.js';\nimport { resolveDisputeSchema } from '../dto/dispute.dto.js';\n\n/** Admin-only global dispute listing and resolution endpoints. */\nexport async function registerAdminDisputeRoutes(app: FastifyInstance): Promise<void> {\n  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {\n    const query = request.query as { status?: string; limit?: string; offset?: string };\n    const status = query.status ? query.status as DisputeStatus : undefined;\n    const uc = app.diContainer.resolve<ListDisputesUseCase>('listDisputesUseCase');\n    const disputes = await uc.execute(status, query.limit ? Number.parseInt(query.limit, 10) : 50, query.offset ? Number.parseInt(query.offset, 10) : 0);\n    return reply.send(ResponseHelper.success(disputes, 'Disputes retrieved successfully'));\n  });\n\n  app.post('/:publicId/resolve', { preHandler: [app.authenticate] }, async (request, reply) => {\n    const { publicId } = request.params as { publicId: string };\n    const input = resolveDisputeSchema.parse(request.body);\n    const user = request.user as { id: string | number };\n    const uc = app.diContainer.resolve<ResolveDisputeUseCase>('resolveDisputeUseCase');\n    const dispute = await uc.execute({\n      disputePublicId: publicId,\n      adminId: Number(user.id),\n      action: input.action,\n      approvedRefundPaise: input.approvedRefundPaise,\n      resolutionNotes: input.resolutionNotes,\n    });\n    return reply.send(ResponseHelper.success(dispute, 'Dispute resolved successfully'));\n  });\n}\n`);
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
  if (/request\.user\s+as\s+\{\s*id:\s*number/.test(c)) violations.push(`${path.relative(root,file)} treats string JWT claim id as a numeric id without explicit conversion`);
  if (/\bPartnerStatus\b/.test(c) && c !== read(adminPartner) && !/import\s+\{[^}]*\bPartnerStatus\b[^}]*\}\s+from\s+['"]@carbroz\/domain-partner['"]/.test(c)) {
    violations.push(`${path.relative(root,file)} references PartnerStatus without the canonical Partner public contract`);
  }
  for (const m of c.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    const target=resolveTs(file,m[1]);
    if (target && !target.startsWith(`${apiRoot}${path.sep}`)) violations.push(`${path.relative(root,file)} imports workspace source ${m[1]}`);
  }
}
if (exists(adminPartner) && /\bPartnerStatus\b/.test(read(adminPartner)) && !/import\s+\{[^}]*\bPartnerStatus\b[^}]*\}\s+from\s+['"]@carbroz\/domain-partner['"]/.test(read(adminPartner))) violations.push('Admin Partner transport references PartnerStatus without importing the canonical Partner enum');
if (exists(customerDispute) && /ListDisputesUseCase|GetDisputeUseCase/.test(read(customerDispute))) violations.push('Customer dispute surface exposes an unscoped read/list authority');
if (violations.length) throw new Error(`API closeout boundary failed:\n${[...new Set(violations)].map(v=>`- ${v}`).join('\n')}`);
console.log('[architecture-closeout-api] API public contracts, transport auth policy, JWT actor ids, Partner status, and dispute surface authority converged');
