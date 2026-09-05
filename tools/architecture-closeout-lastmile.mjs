import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = (relative, content) => {
  const file = path.join(root, relative);
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

function normalizeIdentityAuthorizationComposition() {
  write('domains/identity/infrastructure/authorization/AuthorizationProvider.ts', `import type { IAdminRoleRepository } from '../../domain/repositories/IAdminRoleRepository.js';
import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import type { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';

/** Identity-owned RBAC implementation. API composition consumes only the public authorization port. */
export class AuthorizationProvider {
  constructor(
    private readonly adminRoleRepository: IAdminRoleRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async hasPermission(userId: number, permissionKey: string): Promise<boolean> {
    const roleIds = await this.adminRoleRepository.findRolesForUser(userId);
    if (roleIds.length === 0) return false;

    for (const roleId of roleIds) {
      const role = await this.roleRepository.findWithPermissions(roleId);
      if (role?.name === 'SUPER_ADMIN') return true;
    }

    const permission = await this.permissionRepository.findByKey(permissionKey);
    if (!permission) return false;

    for (const roleId of roleIds) {
      const role = await this.roleRepository.findWithPermissions(roleId);
      if (role?.permissions.includes(permission.id)) return true;
    }
    return false;
  }

  async hasAnyPermission(userId: number, permissionKeys: string[]): Promise<boolean> {
    for (const permissionKey of permissionKeys) {
      if (await this.hasPermission(userId, permissionKey)) return true;
    }
    return false;
  }

  async hasAllPermissions(userId: number, permissionKeys: string[]): Promise<boolean> {
    for (const permissionKey of permissionKeys) {
      if (!(await this.hasPermission(userId, permissionKey))) return false;
    }
    return true;
  }

  async getRoles(userId: number): Promise<string[]> {
    const roleIds = await this.adminRoleRepository.findRolesForUser(userId);
    const roles: string[] = [];
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (role) roles.push(role.name);
    }
    return roles;
  }
}
`);

  const identityModuleFile = path.join(root, 'domains/identity/identity.module.ts');
  if (!fs.existsSync(identityModuleFile)) throw new Error('Identity composition module missing during last-mile closeout');
  let identityModule = fs.readFileSync(identityModuleFile, 'utf8');
  identityModule = identityModule.replace(
    "import { asFunction, type AwilixContainer } from 'awilix';",
    "import { asClass, asFunction, type AwilixContainer } from 'awilix';",
  );
  if (!identityModule.includes("./infrastructure/authorization/AuthorizationProvider.js")) {
    const repositoryImport = "import { PrismaAdminRoleRepository } from './infrastructure/repositories/PrismaAdminRoleRepository.js';";
    if (!identityModule.includes(repositoryImport)) throw new Error('Identity module repository import marker missing');
    identityModule = identityModule.replace(
      repositoryImport,
      `${repositoryImport}\nimport { AuthorizationProvider } from './infrastructure/authorization/AuthorizationProvider.js';`,
    );
  }
  const registrationMarker = '  container.register({\n';
  if (!identityModule.includes('authorizationProvider:')) {
    if (!identityModule.includes(registrationMarker)) throw new Error('Identity registration marker missing');
    identityModule = identityModule.replace(
      registrationMarker,
      `${registrationMarker}    authorizationProvider: asClass(AuthorizationProvider).singleton(),\n`,
    );
  }
  fs.writeFileSync(identityModuleFile, identityModule);

  const apiContainerFile = path.join(root, 'apps/api/src/bootstrap/container/index.ts');
  if (!fs.existsSync(apiContainerFile)) throw new Error('Canonical API bootstrap container missing during last-mile closeout');
  let apiContainer = fs.readFileSync(apiContainerFile, 'utf8');
  apiContainer = apiContainer.replace(
    /import\s+\{([^}]*)\}\s+from\s+(['"]@carbroz\/domain-identity['"]);?/g,
    (_full, names, moduleSpecifier) => {
      const kept = names.split(',').map((name) => name.trim()).filter((name) => name && name !== 'AuthorizationProvider');
      return kept.length ? `import { ${kept.join(', ')} } from ${moduleSpecifier};` : '';
    },
  );
  apiContainer = apiContainer
    .replace(/^\s*authorizationProvider:\s*asClass\(AuthorizationProvider\)\.singleton\(\),?\r?\n/gm, '')
    .replace(/^\s*authorizationProvider:[^\n]*AuthorizationProvider[^\n]*\r?\n/gm, '');

  if (apiContainer.includes('AuthorizationProvider')) throw new Error('API composition still references the concrete Identity AuthorizationProvider');
  if (!apiContainer.includes('registerIdentityModule')) throw new Error('API composition does not invoke the Identity-owned composition module');
  fs.writeFileSync(apiContainerFile, apiContainer);
}

function ensureExecutionContextImport(file, content) {
  if (content.includes('toExecutionContext(request)') && !content.includes('/context/toExecutionContext.js')) {
    let relative = path.relative(path.dirname(file), path.join(root, 'apps/api/src/context/toExecutionContext.ts'))
      .replaceAll('\\', '/')
      .replace(/\.ts$/, '.js');
    if (!relative.startsWith('.')) relative = `./${relative}`;
    return `import { toExecutionContext } from '${relative}';\n${content}`;
  }
  return content;
}

function normalizeApiActorContext() {
  const apiRoot = path.join(root, 'apps/api/src');
  for (const file of walk(apiRoot).filter((candidate) => candidate.endsWith('.ts'))) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('ActorIdentity')) continue;
    fs.writeFileSync(file, content.replace(/\bActorIdentity\b/g, 'ActorContext'));
  }

  write('apps/api/src/context/toExecutionContext.ts', `import type { FastifyRequest } from 'fastify';
import type { ActorContext, ActorKind, ExecutionContext } from '@carbroz/foundation-kernel';

function actorKindFromRoles(roles: readonly string[]): ActorKind {
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('PARTNER')) return 'PARTNER';
  if (roles.includes('GUEST')) return 'GUEST';
  return 'CUSTOMER';
}

function requireNumericActorId(value: string | number): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('AUTHENTICATED_ACTOR_ID_INVALID');
  return id;
}

/** Transport-edge adapter. Domain/application code receives only a strict Foundation context. */
export function toExecutionContext(request: FastifyRequest): ExecutionContext {
  const jwtUser = request.user;
  if (!jwtUser) throw new Error('AUTHENTICATED_ACTOR_REQUIRED');

  const actor: ActorContext = {
    id: requireNumericActorId(jwtUser.id),
    kind: actorKindFromRoles(jwtUser.roles),
    roles: jwtUser.roles,
  };

  return { correlationId: request.traceId || request.id, actor, timestamp: new Date() };
}
`);

  const customerController = path.join(apiRoot, 'surfaces/customer/controllers/customer.customer.controller.ts');
  if (fs.existsSync(customerController)) {
    let content = fs.readFileSync(customerController, 'utf8');

    // The migrated controller previously emitted a ternary-built optional actor. Match the declaration
    // by its canonical type boundary rather than depending on its internal object formatting.
    content = content.replace(
      /const\s+actor:\s*ActorContext\s*\|\s*undefined\s*=\s*[\s\S]*?;(?=\r?\n)/m,
      'const actor: ActorContext = toExecutionContext(request).actor;',
    );
    content = content
      .replace(/\bActorContext\s*\|\s*undefined\b/g, 'ActorContext')
      .replace(/id:\s*request\.user\.id/g, 'id: Number(request.user.id)');
    content = ensureExecutionContextImport(customerController, content);
    fs.writeFileSync(customerController, content);
  }

  const actorIdentityResidue = walk(apiRoot)
    .filter((candidate) => candidate.endsWith('.ts'))
    .filter((file) => fs.readFileSync(file, 'utf8').includes('ActorIdentity'));
  if (actorIdentityResidue.length) throw new Error(`Non-canonical ActorIdentity survived API convergence: ${actorIdentityResidue.join(', ')}`);

  if (fs.existsSync(customerController)) {
    const customerSource = fs.readFileSync(customerController, 'utf8');
    if (customerSource.includes('ActorContext | undefined')) throw new Error('Customer transport still permits an optional application actor');
  }
}

function normalizeConstitutionReferences() {
  const textExtensions = new Set(['.md', '.ts', '.mjs', '.yml', '.yaml', '.json']);
  for (const base of ['docs', 'tests', 'tools', '.github']) {
    for (const file of walk(path.join(root, base))) {
      if (!textExtensions.has(path.extname(file))) continue;
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('MASTER_BACKEND_CONSTITUTION.md')) continue;
      fs.writeFileSync(file, content.replaceAll('MASTER_BACKEND_CONSTITUTION.md', 'MASTER-BACKEND-CONSTITUTION.md'));
    }
  }
}

normalizeIdentityAuthorizationComposition();
normalizeApiActorContext();
normalizeConstitutionReferences();

const bookingUseCases = path.join(root, 'domains/booking/application/BookingUseCases.ts');
if (!fs.existsSync(bookingUseCases)) throw new Error('Booking application file missing during last-mile closeout');

let source = fs.readFileSync(bookingUseCases, 'utf8');
const classStart = source.indexOf('export class AssignPartnerToBookingUseCase');
const nextBoundary = source.indexOf('export interface TransitionBookingStatusInput', classStart);
if (classStart >= 0) {
  if (nextBoundary <= classStart) throw new Error('Unable to locate deterministic boundary after Booking dispatch class');
  source = source.slice(0, classStart) + source.slice(nextBoundary);
}
source = source.replace(/^\/\*\*[^\n]*AssignPartnerToBookingUseCase[^\n]*\*\/\r?\n/m, '');
source = source.replace(/^import\s+type\s+\{[^\n}]*IPartnerRepository[^\n}]*\}\s+from\s+['"][^'"]+['"];?\r?\n/m, '');
const executableResidue = source.split(/\r?\n/).filter((line) => line.includes('export class AssignPartnerToBookingUseCase') || line.includes('IPartnerRepository'));
if (executableResidue.length) throw new Error(`Booking still retains executable dispatch/Partner repository authority after last-mile closeout:\n${executableResidue.join('\n')}`);
fs.writeFileSync(bookingUseCases, source);

const operationsDispatch = path.join(root, 'domains/operations/application/dispatch/AssignPartnerToBookingUseCase.ts');
const operationsPublic = path.join(root, 'domains/operations/public/index.ts');
if (!fs.existsSync(operationsDispatch)) throw new Error('Operations dispatch owner was not created');
if (!fs.existsSync(operationsPublic) || !fs.readFileSync(operationsPublic, 'utf8').includes('AssignPartnerToBookingUseCase')) throw new Error('Operations dispatch owner is not publicly exposed');

write('tests/contracts/canonical-public-contracts.contract.test.ts', `import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const publicEntries = [
  'domains/identity/public/index.ts', 'domains/partner/public/index.ts', 'domains/customer/public/index.ts',
  'domains/catalog-pricing/public/index.ts', 'domains/booking/public/index.ts', 'domains/operations/public/index.ts',
  'domains/financials/public/index.ts', 'domains/communications/public/index.ts', 'domains/engagement/public/index.ts',
  'domains/configuration/public/index.ts', 'domains/dispute/public/index.ts', 'domains/enterprise/public/index.ts',
  'domains/audit/public/index.ts', 'sdui/registry/public/index.ts',
] as const;

describe('canonical public contracts', () => {
  it('publishes deliberate bounded-context entry points without concrete infrastructure', () => {
    for (const entry of publicEntries) {
      const file = path.join(root, entry);
      expect(fs.existsSync(file)).toBe(true);
      const publicSource = fs.readFileSync(file, 'utf8');
      expect(publicSource).not.toContain('/infrastructure/');
      expect(publicSource).not.toContain('@prisma/client');
    }
  });

  it('keeps universal Money and strict ExecutionContext authority in Foundation', () => {
    const money = fs.readFileSync(path.join(root, 'foundation/kernel/src/domain/Money.ts'), 'utf8');
    const contracts = fs.readFileSync(path.join(root, 'foundation/kernel/src/application/contracts.ts'), 'utf8');
    expect(money).toContain('class Money');
    expect(money).toContain('amountMinor');
    expect(contracts).toContain('interface ExecutionContext');
    expect(contracts).toContain('actor: ActorContext');
    expect(contracts).toContain('id: number');
    expect(contracts).not.toContain('actor?:');
  });
});
`);

fs.rmSync(path.join(root, 'tools/architecture-closeout-finalize.mjs'), { force: true });
fs.rmSync(path.join(root, 'tools/architecture-closeout-postfinal.mjs'), { force: true });

console.log('[architecture-closeout-lastmile] Identity authorization, strict numeric API actors, Booking dispatch ownership, public-contract test and temporary finalizer cleanup completed');
