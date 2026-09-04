import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const normalize = (value) => value.replaceAll('\\', '/');
const rel = (file, base = root) => normalize(path.relative(base, file));
const exists = (file) => fs.existsSync(file);
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};
const walk = (dir) => {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', 'dist', 'generated', '.git'].includes(entry.name)) return [];
    const absolute = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
};

const rootModules = [
  'apps/api',
  'domains/identity', 'domains/partner', 'domains/customer', 'domains/catalog-pricing',
  'domains/booking', 'domains/operations', 'domains/financials', 'domains/communications',
  'domains/engagement', 'domains/configuration', 'domains/dispute', 'domains/enterprise', 'domains/audit',
  'sdui/ui-sdk', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage',
  'platform/observability', 'platform/integrations',
  'foundation/kernel',
];

const ownership = {
  'apps/api': ['Executable Fastify application and composition root', 'Partner/Customer/Admin transport surfaces', 'HTTP validation, lifecycle, response/error mapping and dependency wiring'],
  'domains/identity': ['Authentication identity, sessions and OTP lifecycle', 'roles, permissions and authorization contracts', 'token/session application policy'],
  'domains/partner': ['Partner account/profile and organization membership', 'KYC, verification and training capability', 'declared availability and partner lifecycle policy'],
  'domains/customer': ['Customer profile and preferences', 'customer addresses', 'customer garage/vehicle ownership'],
  'domains/catalog-pricing': ['Service catalog and add-ons', 'pricing tiers/multipliers', 'service price calculation policy'],
  'domains/booking': ['Booking aggregate and immutable snapshots', 'booking state machine/transitions', 'booking lifecycle invariants'],
  'domains/operations': ['Slot inventory/capacity and availability feasibility', 'dispatch/assignment/radius workload', 'tracking/ETA/service execution operations'],
  'domains/financials': ['Payment, refund, invoice and payout lifecycle', 'commission/tax/settlement policy', 'double-entry ledger and financial invariants'],
  'domains/communications': ['Notification intent, device tokens and delivery records', 'channel/template/preference application policy', 'stable communication provider ports'],
  'domains/engagement': ['Reviews and ratings', 'coupons/promotions/offers', 'customer/partner engagement policy'],
  'domains/configuration': ['Persisted product/runtime configuration', 'maintenance/update/bootstrap decisions', 'feature rollout policy'],
  'domains/dispute': ['Dispute aggregate and lifecycle', 'dispute reason/status policy', 'resolution/settlement decision semantics'],
  'domains/enterprise': ['Corporate accounts and organization members', 'corporate fleet enrollment', 'corporate credit/booking eligibility'],
  'domains/audit': ['Immutable business/security audit semantics', 'actor/action audit records', 'audit persistence contract'],
  'sdui/ui-sdk': ['Canonical Template/Component/Section/Group/Element vocabulary', 'generic definitions, builders/factories and registries', 'hierarchy/property/action/accessibility validation'],
  'sdui/registry': ['SDUI definition lifecycle', 'draft/publish/version/history/rollback/archive', 'serving canonical UI SDK structures'],
  'platform/database': ['Prisma client lifecycle', 'generic transaction/database capability', 'technical database adapters only'],
  'platform/cache': ['Generic cache port and adapters', 'expiry/serialization mechanics', 'replaceable cache infrastructure'],
  'platform/messaging': ['Generic queue/event transport', 'technical retry/delivery mechanics', 'replaceable messaging infrastructure'],
  'platform/storage': ['Generic object/file storage port', 'upload/download/delete adapters', 'replaceable storage infrastructure'],
  'platform/observability': ['Structured logger factory', 'PII/secret redaction', 'logs/metrics/traces and request-flow telemetry'],
  'platform/integrations': ['Concrete external vendor adapters', 'maps/payment/communication integrations', 'translation from vendor APIs to stable CarBroz ports'],
  'foundation/kernel': ['Universal domain-independent primitives', 'errors/results/Money', 'execution actor/context and universal provider contracts'],
};

const exclusions = {
  'apps/api': ['Business entities/aggregates', 'business repository ownership', 'pricing/booking/payment/KYC rules'],
  'platform/database': ['Business repositories', 'business use cases', 'bounded-context query policy'],
  'platform/integrations': ['Business policy', 'bounded-context entities', 'vendor-specific types in domain/application contracts'],
  'platform/observability': ['Immutable business Audit records', 'business decisions', 'raw secret/OTP/token/PII logging'],
  'foundation/kernel': ['CarBroz feature entities', 'vendor implementations', 'feature-specific helpers'],
  'sdui/ui-sdk': ['Customer/Partner business queries', 'draft/publish lifecycle', 'frontend native rendering'],
  'sdui/registry': ['Redefining SDUI structural mechanics', 'business-specific screen composition'],
};

function packageRootFor(moduleDir) {
  const relative = rel(moduleDir);
  return rootModules.find((candidate) => relative === candidate || relative.startsWith(`${candidate}/`));
}

function layerFor(file) {
  const value = normalize(file);
  if (value.includes('/domain/')) return 'Domain';
  if (value.includes('/application/')) return 'Application';
  if (value.includes('/infrastructure/')) return 'Infrastructure';
  if (value.includes('/composition/')) return 'Composition';
  if (value.includes('/surfaces/') || value.includes('/transport/') || value.includes('/presentation/')) return 'Transport';
  if (value.includes('/definitions/')) return 'Definition';
  if (value.includes('/public/')) return 'Public contract';
  return 'Module support';
}

function declarations(file) {
  const text = read(file);
  const result = [];
  const patterns = [
    ['class', /\b(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/g],
    ['interface', /\b(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/g],
    ['type', /\b(?:export\s+)?type\s+([A-Za-z_$][\w$]*)/g],
    ['enum', /\b(?:export\s+)?enum\s+([A-Za-z_$][\w$]*)/g],
    ['function', /\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g],
  ];
  for (const [kind, regex] of patterns) for (const match of text.matchAll(regex)) result.push({ kind, name: match[1] });
  return result;
}

function responsibility(name, layer) {
  if (name.endsWith('UseCase')) return 'Orchestrates one application capability through domain rules and ports; it must not contain HTTP or vendor-specific logic.';
  if (name.startsWith('Prisma') && name.endsWith('Repository')) return 'Infrastructure adapter implementing a bounded-context repository contract with Prisma and mapping persistence state to canonical models.';
  if (name.endsWith('Repository')) return 'Stable persistence boundary owned by this bounded context; consumers depend on the contract rather than a database implementation.';
  if (name.endsWith('Provider')) return 'Stable capability port or adapter that localizes replaceable infrastructure and provider-specific behavior.';
  if (name.endsWith('Controller')) return 'Transport adapter that validates/maps requests to application capabilities and maps canonical results/errors back to HTTP.';
  if (name.endsWith('Definition')) return 'Reusable SDUI definition implementing one canonical structural type without business-specific coupling.';
  if (name.endsWith('Registry')) return 'Registration/lookup authority that supports additive extension and rejects duplicates/unknown definitions.';
  if (name.endsWith('Factory')) return 'Centralizes creation when construction varies by supported type/configuration while preserving invariants.';
  if (name.endsWith('Builder')) return 'Incrementally constructs a complex canonical object/hierarchy while enforcing valid structure.';
  if (name.endsWith('Mapper')) return 'Translates across a boundary so persistence/transport/vendor representations do not leak inward.';
  if (name.endsWith('Service')) return `Focused ${layer.toLowerCase()} service; it must not absorb unrelated bounded-context responsibilities.`;
  return `${layer} artifact whose ownership and responsibility must remain limited to this module's declared capability.`;
}

function classTestCases(name) {
  if (name.endsWith('UseCase')) return ['happy path', 'invalid/missing input', 'authorization/business-policy rejection', 'dependency failure propagation/normalization', 'side effects exactly once', 'regression for every fixed bug'];
  if (name.includes('Repository')) return ['create/save + read round trip', 'not found', 'unique/FK/constraint failure', 'transaction rollback', 'mapping fidelity', 'concurrency/idempotency where applicable'];
  if (name.endsWith('Provider')) return ['contract happy path', 'invalid input', 'timeout/unavailable provider', 'provider error normalization', 'no vendor type leakage', 'alternate implementation passes same contract suite'];
  if (name.endsWith('Controller')) return ['valid request mapping', 'schema validation error', 'authorization denial', 'application/domain error mapping', 'response contract', 'no business-rule implementation'];
  if (/(Definition|Registry|Factory|Builder)$/.test(name)) return ['valid create/register', 'duplicate/unknown rejection', 'invalid hierarchy/properties', 'deterministic output', 'additive extension without existing implementation edits', 'version compatibility where applicable'];
  return ['valid construction/behavior', 'invalid invariant/input', 'boundary values', 'failure leaves state consistent', 'dependency failure where applicable', 'regression for fixed bugs'];
}

function existingTests(moduleDir) {
  return walk(moduleDir).filter((file) => /\.(?:spec|test)\.ts$/.test(file)).sort();
}
function testNames(file) {
  return [...read(file).matchAll(/\b(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g)].map((m) => m[1]);
}

function discoverModules() {
  const modules = new Set(rootModules.filter((module) => exists(path.join(root, module))));
  for (const rootModule of rootModules) {
    const absolute = path.join(root, rootModule);
    if (!exists(absolute)) continue;
    for (const file of walk(absolute)) {
      if (!/\.(?:module|manifest)\.ts$/.test(file) && path.basename(file) !== 'module.manifest.ts') continue;
      const dir = path.dirname(file);
      if (dir !== absolute && walk(dir).some((candidate) => candidate.endsWith('.ts') && !/\.(?:spec|test)\.ts$/.test(candidate))) modules.add(rel(dir));
    }
  }
  for (const known of [
    'domains/customer/address', 'domains/customer/profile', 'domains/customer/garage',
    'domains/partner/kyc',
    'domains/financials/payment', 'domains/financials/invoice', 'domains/financials/payout',
    'domains/engagement/review', 'domains/engagement/coupon',
    'domains/operations/tracking',
  ]) if (exists(path.join(root, known)) && walk(path.join(root, known)).some((f) => f.endsWith('.ts'))) modules.add(known);
  return [...modules].sort();
}

function titleFor(moduleRel) {
  return moduleRel.split('/').map((part) => part.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())).join(' / ');
}

function render(moduleRel) {
  const dir = path.join(root, moduleRel);
  const owner = packageRootFor(dir) ?? moduleRel;
  const productionFiles = walk(dir).filter((f) => f.endsWith('.ts') && !/\.(?:spec|test)\.ts$/.test(f)).sort();
  const symbols = productionFiles.flatMap((file) => declarations(file).map((decl) => ({ ...decl, file })));
  const classes = symbols.filter((symbol) => symbol.kind === 'class');
  const tests = existingTests(dir);
  const publicEntry = [path.join(dir, 'public/index.ts'), path.join(dir, 'src/index.ts')].find(exists);
  const publicExports = publicEntry ? read(publicEntry).split('\n').filter((line) => line.trim().startsWith('export ')).map((line) => line.trim()) : [];
  const owns = ownership[moduleRel] ?? ownership[owner] ?? [`The ${path.basename(moduleRel)} capability inside ${owner}`];
  const doesNotOwn = exclusions[moduleRel] ?? exclusions[owner] ?? ['Responsibilities owned by sibling bounded contexts', 'HTTP/vendor details unless this is explicitly a transport/infrastructure module', 'Generic shared concepts merely because they are reused'];

  return [
    `# ${titleFor(moduleRel)}`,
    '',
    '> Architecture documentation generated from the constitution-converged source tree. If code and this document disagree, investigate ownership first; never edit documentation merely to justify an invalid structure.',
    '',
    '## Why this module exists', '',
    `This module is owned by **${owner}**. It exists to provide a cohesive capability with a single architectural owner and a bounded blast radius of change.`, '',
    '## What this module owns', '', ...owns.map((item) => `- ${item}`), '',
    '## What this module explicitly does not own', '', ...doesNotOwn.map((item) => `- ${item}`), '',
    '## Dependency direction and callers', '',
    '- The Master Backend Constitution is authoritative for allowed dependencies.',
    '- Internal source must not import its own published package boundary; local declarations are used internally.',
    '- Other bounded contexts consume approved public contracts only, never internal folders.',
    '- Domain/application code does not import Fastify, API DTOs, Prisma implementations, or vendor SDKs.',
    '- Provider replacement should normally be: new adapter + composition wiring + contract tests.',
    '- Adding a capability should minimize unrelated-file edits; blast radius is an acceptance criterion.', '',
    '## Source and class inventory', '',
    '| File | Layer | Symbols |', '| --- | --- | --- |',
    ...productionFiles.map((file) => `| \`${rel(file, dir)}\` | ${layerFor(file)} | ${declarations(file).map((d) => `${d.kind} ${d.name}`).join('<br>') || 'module-level exports/constants'} |`), '',
    '## Class responsibilities', '',
    ...(classes.length ? ['| Class | File | Why the class exists |', '| --- | --- | --- |', ...classes.map((c) => `| \`${c.name}\` | \`${rel(c.file, dir)}\` | ${responsibility(c.name, layerFor(c.file))} |`)] : ['_No concrete classes are declared directly under this module boundary._']), '',
    '## Public API', '',
    ...(publicExports.length ? ['```ts', ...publicExports, '```'] : ['_No dedicated public entry point exists at this exact module boundary; external access is governed by its owning package public API._']), '',
    '## Existing executable tests', '',
    ...(tests.length ? ['| Test file | Current test cases |', '| --- | --- |', ...tests.map((file) => `| \`${rel(file, dir)}\` | ${testNames(file).map((name) => `\`${name}\``).join('<br>') || 'Inspect suite: no literal it/test names detected'} |`)] : ['_No colocated tests detected. This does not waive the required matrix below; cross-repository tests may also cover this module._']), '',
    '## Complete module test matrix', '',
    '| Test area | Required positive coverage | Required negative/failure coverage | Regression/isolation coverage |',
    '| --- | --- | --- | --- |',
    '| Domain | valid creation, values and legal transitions | invalid values, illegal transitions and invariants | each fixed domain bug retained as a permanent regression |',
    '| Application | successful orchestration and canonical result | bad input, forbidden policy, conflict/not-found, dependency failure | side effects exactly once; unrelated contexts unchanged |',
    '| Persistence | round-trip and transaction success | FK/unique/not-found/rollback failures | idempotency and concurrency where applicable |',
    '| Contracts | valid consumer usage and serialization | unsupported/invalid/version input | public API/backward compatibility |',
    '| Providers | canonical capability success | timeout, unavailable/malformed provider response | alternate provider passes same behavioral contract |',
    '| Architecture | all allowed imports and public boundaries | forbidden imports, cycles, self-imports, legacy paths | CI prevents architecture drift |',
    '| Security/privacy | authorized flow and redacted telemetry | unauthorized/replay/abuse/sensitive input | tokens/OTP/secrets/PII never leak to logs |',
    '| Integration | real collaboration between canonical boundaries | partial failure and rollback | retries do not duplicate state |',
    '| E2E | complete user-observable successful flow | invalid/expired/denied/replayed flow | compatible versioned behavior |', '',
    '### Pass-to-pass / fail-to-fail rule', '',
    'Every important rule must prove both sides: valid behavior passes; invalid behavior fails for the intended reason. Every production bug fix starts with a reproducing failing test, then that regression test remains permanently after the fix.', '',
    '## Class-specific required tests', '',
    ...(classes.length ? ['| Class | Required cases |', '| --- | --- |', ...classes.map((c) => `| \`${c.name}\` | ${classTestCases(c.name).map((t) => `\`${t}\``).join('<br>')} |`)] : ['_No concrete classes currently require a class-specific matrix at this boundary._']), '',
    '## Extension and replacement rules', '',
    '- Prefer additive extension: implementation + registration/composition + tests.',
    '- Do not add a giant switch when a registry/strategy/provider boundary already solves the extension problem.',
    '- Do not expose vendor-specific types through domain/application contracts.',
    '- Do not create Common/Shared ownership because multiple modules use a concept; ownership follows business meaning.',
    '- If a new class cannot be explained cleanly in this README, treat that as an architecture finding before merging.', '',
    '## Definition of Done', '',
    '- Structure and ownership match `docs/MASTER-BACKEND-CONSTITUTION.md`.',
    '- Build and lint are green.',
    '- Positive, negative and regression unit tests are green.',
    '- Architecture/contract/integration/E2E tests are present where their boundaries exist.',
    '- Meaningful exported classes/interfaces/functions have TSDoc explaining intent, dependencies and non-responsibilities.',
    '- Public contract compatibility and blast radius were reviewed.',
    '- This README source/class/test inventory matches the final source tree.',
  ].join('\n');
}

const modules = discoverModules();
for (const moduleRel of modules) write(path.join(root, moduleRel, 'README.md'), render(moduleRel));

write(path.join(root, 'tests/architecture/module-documentation.policy.test.ts'), `import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
const modules = ${JSON.stringify(modules, null, 2)} as const;
const required = [
  '## Why this module exists',
  '## What this module owns',
  '## Dependency direction and callers',
  '## Source and class inventory',
  '## Existing executable tests',
  '## Complete module test matrix',
  '## Class-specific required tests',
  '## Definition of Done',
] as const;
describe('module README architecture policy', () => {
  for (const moduleRel of modules) {
    it(moduleRel + ' documents ownership, source and tests', () => {
      const file = path.join(root, moduleRel, 'README.md');
      expect(fs.existsSync(file), moduleRel + ' must have README.md').toBe(true);
      const content = fs.readFileSync(file, 'utf8');
      for (const section of required) expect(content).toContain(section);
      expect(content).toContain('Master Backend Constitution');
      expect(content).toContain('Pass-to-pass / fail-to-fail');
      expect(content).toContain('blast radius');
    });
  }
});
`);

console.log(`[module-readmes] generated ${modules.length} module READMEs and documentation policy test`);
