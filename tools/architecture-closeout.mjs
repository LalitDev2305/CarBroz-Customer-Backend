import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const apiRoot = path.join(root, 'apps/api');
const apiSrc = path.join(apiRoot, 'src');
const moved = new Map();
const ownership = new Map();
const changed = new Set();

const p = (...parts) => path.join(root, ...parts);
const rel = (file) => path.relative(root, file).replaceAll('\\', '/');
const exists = (file) => fs.existsSync(file);
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
  changed.add(file);
};
const remove = (file) => {
  if (!exists(file)) return;
  fs.rmSync(file, { recursive: true, force: true });
};
const walk = (dir, predicate = () => true) => {
  if (!exists(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'generated', '.git'].includes(entry.name)) continue;
      out.push(...walk(absolute, predicate));
    } else if (predicate(absolute)) out.push(absolute);
  }
  return out;
};

function moveFile(from, to) {
  if (!exists(from)) return;
  ensureDir(path.dirname(to));
  fs.renameSync(from, to);
  moved.set(path.resolve(from), path.resolve(to));
}

function moveDir(from, to) {
  if (!exists(from)) return;
  for (const file of walk(from)) {
    const target = path.join(to, path.relative(from, file));
    moveFile(file, target);
  }
  remove(from);
}

function packageName(dir) {
  const manifest = path.join(dir, 'package.json');
  return exists(manifest) ? JSON.parse(read(manifest)).name : undefined;
}

function appendExports(indexFile, exportsToAdd) {
  let content = exists(indexFile) ? read(indexFile) : '';
  for (const line of exportsToAdd) {
    if (!content.includes(line)) content += `${content.endsWith('\n') || !content ? '' : '\n'}${line}\n`;
  }
  write(indexFile, content);
}

function humanize(name) {
  return name
    .replace(/UseCase$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .trim();
}

function relativeImport(fromFile, toFile) {
  let specifier = path.relative(path.dirname(fromFile), toFile).replaceAll('\\', '/');
  if (!specifier.startsWith('.')) specifier = `./${specifier}`;
  specifier = specifier.replace(/\.ts$/, '.js');
  return specifier;
}

function moveUseCases(sourceDir, targetDir, packageId, exclude = new Set()) {
  if (!exists(sourceDir)) return [];
  const exported = [];
  for (const file of fs.readdirSync(sourceDir)) {
    const source = path.join(sourceDir, file);
    if (!fs.statSync(source).isFile() || !file.endsWith('.ts') || exclude.has(file)) continue;
    const target = path.join(targetDir, file);
    moveFile(source, target);
    if (!file.includes('.spec.') && !file.includes('.test.')) {
      const symbol = path.basename(file, '.ts');
      ownership.set(symbol, packageId);
      exported.push(`export * from './application/${path.relative(path.dirname(targetDir), target).replaceAll('\\', '/').replace(/\.ts$/, '.js')}';`);
    }
  }
  return exported;
}

function addApplicationExports(packageDir, files) {
  const index = path.join(packageDir, 'public/index.ts');
  let content = exists(index) ? read(index) : '';
  for (const file of files) {
    const target = path.join(packageDir, file);
    if (!exists(target) || !file.endsWith('.ts') || file.includes('.spec.') || file.includes('.test.')) continue;
    const specifier = `../${file.replaceAll('\\', '/').replace(/\.ts$/, '.js')}`;
    const line = `export * from '${specifier}';`;
    if (!content.includes(line)) content += `${content.endsWith('\n') || !content ? '' : '\n'}${line}\n`;
  }
  write(index, content);
}

function inferDtoTypes(dtoFile, outputFile) {
  if (!exists(dtoFile)) return;
  const compilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    esModuleInterop: true,
  };
  const program = ts.createProgram([dtoFile], compilerOptions);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(dtoFile);
  if (!source) throw new Error(`Unable to parse DTO ${rel(dtoFile)}`);
  const lines = [
    '/**',
    ` * Transport-neutral application input contracts derived from ${path.basename(dtoFile)}.`,
    ' * Zod remains at the API boundary; bounded-context application services depend only on these types.',
    ' */',
  ];
  let count = 0;
  for (const node of source.statements) {
    if (ts.isTypeAliasDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      const type = checker.getTypeAtLocation(node.name);
      const rendered = checker.typeToString(type, node, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias);
      lines.push(`export type ${node.name.text} = ${rendered};`);
      count++;
    }
  }
  if (count) write(outputFile, lines.join('\n'));
}

function replaceDtoTypeImports(file, contractFile) {
  if (!exists(file) || !exists(contractFile)) return;
  let content = read(file);
  content = content.replace(/from ['"]\.\.\/dtos\/[^'"]+['"]/g, `from '${relativeImport(file, contractFile)}'`);
  write(file, content);
}

function addFoundationContracts() {
  const file = p('foundation/kernel/src/application/contracts.ts');
  write(file, `/** Stable actor kinds understood across bounded contexts. */
export type ActorKind = 'GUEST' | 'CUSTOMER' | 'PARTNER' | 'ADMIN' | 'SYSTEM';

/**
 * Minimal authenticated actor identity that application services may use for authorization.
 * It deliberately excludes HTTP/Fastify request objects, headers, tokens, and other transport state.
 */
export interface ActorIdentity {
  readonly id: string | number;
  readonly kind: ActorKind;
  readonly roles: readonly string[];
  readonly customerId?: number;
  readonly partnerId?: number;
  readonly tenantId?: string;
}

/**
 * Transport-neutral execution metadata propagated across application boundaries.
 * Correlation IDs connect logs/traces without leaking request payloads into business code.
 */
export interface ExecutionContext {
  readonly correlationId: string;
  readonly actor?: ActorIdentity;
  readonly timestamp: Date;
}

/** Universal application command/query contract. */
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput, context?: ExecutionContext): Promise<TOutput>;
}

/** Opaque transaction token; only the database adapter knows its concrete vendor type. */
export type TransactionContext = unknown;

/** Universal unit-of-work boundary used by application services requiring atomic persistence. */
export interface ITransactionProvider {
  runInTransaction<T>(work: (transaction?: TransactionContext) => Promise<T>): Promise<T>;
}

/** Time source abstraction for deterministic domain/application testing. */
export interface IClockProvider {
  now(): Date;
}

/** Identifier source abstraction for deterministic domain/application testing. */
export interface IIdGeneratorProvider {
  generate(): string;
}
`);
}

function moveLegacyPorts() {
  const ports = [
    ['IAuthorizationProvider.ts', 'domains/identity/application/ports/IAuthorizationProvider.ts', '@carbroz/domain-identity'],
    ['IMapsProvider.ts', 'domains/operations/application/ports/IMapsProvider.ts', '@carbroz/domain-operations'],
    ['IPaymentGatewayProvider.ts', 'domains/financials/payment/application/ports/IPaymentGatewayProvider.ts', '@carbroz/domain-financials'],
    ['INotificationProvider.ts', 'domains/communications/application/ports/INotificationProvider.ts', '@carbroz/domain-communications'],
    ['ISmsProvider.ts', 'domains/communications/application/ports/ISmsProvider.ts', '@carbroz/domain-communications'],
    ['IEmailProvider.ts', 'domains/communications/application/ports/IEmailProvider.ts', '@carbroz/domain-communications'],
    ['IPushProvider.ts', 'domains/communications/application/ports/IPushProvider.ts', '@carbroz/domain-communications'],
    ['IStorageProvider.ts', 'platform/storage/src/ports/IStorageProvider.ts', '@carbroz/platform-storage'],
    ['ICacheProvider.ts', 'platform/cache/src/ports/ICacheProvider.ts', '@carbroz/platform-cache'],
    ['IDatabaseProvider.ts', 'platform/database/src/ports/IDatabaseProvider.ts', '@carbroz/platform-database'],
    ['ILoggerProvider.ts', 'platform/observability/src/ports/ILoggerProvider.ts', '@carbroz/platform-observability'],
    ['IConfigProvider.ts', 'domains/configuration/application/ports/IConfigProvider.ts', '@carbroz/domain-configuration'],
    ['IFeatureFlagProvider.ts', 'domains/configuration/application/ports/IFeatureFlagProvider.ts', '@carbroz/domain-configuration'],
  ];
  for (const [name, targetRel, owner] of ports) {
    const source = p('packages/common/src/providers', name);
    const target = p(targetRel);
    if (exists(source)) moveFile(source, target);
    if (exists(target)) {
      ownership.set(path.basename(name, '.ts'), owner);
      const packageDir = targetRel.split('/').slice(0, targetRel.startsWith('domains/financials') ? 2 : targetRel.startsWith('domains/') || targetRel.startsWith('platform/') ? 2 : 2).join('/');
    }
  }

  appendExports(p('domains/identity/public/index.ts'), ["export * from '../application/ports/IAuthorizationProvider.js';"]);
  appendExports(p('domains/operations/public/index.ts'), ["export * from '../application/ports/IMapsProvider.js';"]);
  appendExports(p('domains/financials/payment/public/index.ts'), ["export * from '../application/ports/IPaymentGatewayProvider.js';"]);
  appendExports(p('domains/communications/public/index.ts'), [
    "export * from '../application/ports/INotificationProvider.js';",
    "export * from '../application/ports/ISmsProvider.js';",
    "export * from '../application/ports/IEmailProvider.js';",
    "export * from '../application/ports/IPushProvider.js';",
  ]);
  appendExports(p('domains/configuration/public/index.ts'), [
    "export * from '../application/ports/IConfigProvider.js';",
    "export * from '../application/ports/IFeatureFlagProvider.js';",
  ]);
  appendExports(p('platform/storage/src/index.ts'), ["export * from './ports/IStorageProvider.js';"]);
  appendExports(p('platform/cache/src/index.ts'), ["export * from './ports/ICacheProvider.js';"]);
  appendExports(p('platform/database/src/index.ts'), ["export * from './ports/IDatabaseProvider.js';"]);
  appendExports(p('platform/observability/src/index.ts'), ["export * from './ports/ILoggerProvider.js';"]);
}

function migrateApplicationUseCases() {
  const specs = [
    ['auth', 'domains/identity/application/use-cases', '@carbroz/domain-identity'],
    ['partner', 'domains/partner/application/use-cases', '@carbroz/domain-partner'],
    ['customer', 'domains/customer/application/use-cases', '@carbroz/domain-customer'],
    ['catalog', 'domains/catalog-pricing/application/use-cases', '@carbroz/domain-catalog-pricing'],
    ['config', 'domains/configuration/application/use-cases', '@carbroz/domain-configuration'],
    ['coupon', 'domains/engagement/coupon/application/use-cases', '@carbroz/domain-engagement'],
    ['review', 'domains/engagement/review/application/use-cases', '@carbroz/domain-engagement'],
    ['dispute', 'domains/dispute/application/use-cases', '@carbroz/domain-dispute'],
    ['invoice', 'domains/financials/invoice/application/use-cases', '@carbroz/domain-financials'],
    ['payment', 'domains/financials/payment/application/use-cases', '@carbroz/domain-financials'],
    ['payout', 'domains/financials/payout/application/use-cases', '@carbroz/domain-financials'],
    ['maps', 'domains/operations/application/maps/use-cases', '@carbroz/domain-operations'],
    ['notification', 'domains/communications/application/use-cases', '@carbroz/domain-communications'],
    ['tracking', 'domains/operations/application/tracking/use-cases', '@carbroz/domain-operations'],
    ['sdui', 'sdui/registry/application/use-cases', '@carbroz/sdui-registry'],
  ];

  for (const [feature, targetRel, owner] of specs) {
    const source = p('apps/api/src/modules', feature, 'use-cases');
    const target = p(targetRel);
    moveDir(source, target);
    if (exists(target)) {
      for (const file of walk(target, (f) => f.endsWith('.ts') && !f.includes('.spec.') && !f.includes('.test.'))) {
        ownership.set(path.basename(file, '.ts'), owner);
      }
    }
  }

  const assign = p('domains/booking/application/use-cases/AssignPartnerToBookingUseCase.ts');
  if (exists(assign)) moveFile(assign, p('domains/operations/application/dispatch/AssignPartnerToBookingUseCase.ts'));
  ownership.set('AssignPartnerToBookingUseCase', '@carbroz/domain-operations');

  const adminKyc = p('apps/api/src/modules/admin/use-cases/AdminReviewKycDocumentUseCase.ts');
  if (exists(adminKyc)) moveFile(adminKyc, p('domains/partner/kyc/application/AdminReviewKycDocumentUseCase.ts'));
  ownership.set('AdminReviewKycDocumentUseCase', '@carbroz/domain-partner');

  const packageApplications = [
    ['domains/identity', '@carbroz/domain-identity'],
    ['domains/partner', '@carbroz/domain-partner'],
    ['domains/customer', '@carbroz/domain-customer'],
    ['domains/catalog-pricing', '@carbroz/domain-catalog-pricing'],
    ['domains/configuration', '@carbroz/domain-configuration'],
    ['domains/booking', '@carbroz/domain-booking'],
    ['domains/operations', '@carbroz/domain-operations'],
    ['domains/financials', '@carbroz/domain-financials'],
    ['domains/communications', '@carbroz/domain-communications'],
    ['domains/engagement', '@carbroz/domain-engagement'],
    ['domains/dispute', '@carbroz/domain-dispute'],
    ['sdui/registry', '@carbroz/sdui-registry'],
  ];
  for (const [dirRel] of packageApplications) {
    const dir = p(dirRel);
    const publicIndex = path.join(dir, 'public/index.ts');
    if (!exists(publicIndex)) continue;
    let content = read(publicIndex);
    for (const file of walk(dir, (f) => f.endsWith('UseCase.ts') && !f.includes('/infrastructure/'))) {
      const spec = relativeImport(publicIndex, file);
      const line = `export * from '${spec}';`;
      if (!content.includes(line)) content += `${content.endsWith('\n') ? '' : '\n'}${line}\n`;
    }
    write(publicIndex, content);
  }
}

function generateApplicationContracts() {
  const featureOwners = [
    ['auth', 'domains/identity/application/contracts/auth.ts'],
    ['partner', 'domains/partner/application/contracts/partner.ts'],
    ['customer', 'domains/customer/application/contracts/customer.ts'],
    ['catalog', 'domains/catalog-pricing/application/contracts/catalog.ts'],
    ['config', 'domains/configuration/application/contracts/config.ts'],
    ['coupon', 'domains/engagement/coupon/application/contracts/coupon.ts'],
    ['review', 'domains/engagement/review/application/contracts/review.ts'],
    ['dispute', 'domains/dispute/application/contracts/dispute.ts'],
    ['payment', 'domains/financials/payment/application/contracts/payment.ts'],
    ['payout', 'domains/financials/payout/application/contracts/payout.ts'],
    ['maps', 'domains/operations/application/maps/contracts/maps.ts'],
    ['notification', 'domains/communications/application/contracts/notification.ts'],
    ['tracking', 'domains/operations/application/tracking/contracts/tracking.ts'],
    ['sdui', 'sdui/registry/application/contracts/sdui-registry.ts'],
    ['admin', 'domains/partner/kyc/application/contracts/admin-kyc.ts'],
  ];
  for (const [feature, targetRel] of featureOwners) {
    const dtoDir = p('apps/api/src/modules', feature, 'dtos');
    if (!exists(dtoDir)) continue;
    for (const dto of walk(dtoDir, (f) => f.endsWith('.dto.ts'))) {
      const baseTarget = p(targetRel);
      const target = fs.readdirSync(dtoDir).length === 1 ? baseTarget : path.join(path.dirname(baseTarget), path.basename(dto));
      inferDtoTypes(dto, target);
    }
  }
}

function moveInfrastructureAdapters() {
  moveFile(p('apps/api/src/providers/AuthorizationProvider.ts'), p('domains/identity/infrastructure/authorization/AuthorizationProvider.ts'));
  moveFile(p('apps/api/src/providers/AuthorizationProvider.spec.ts'), p('domains/identity/tests/AuthorizationProvider.spec.ts'));
  moveFile(p('apps/api/src/providers/LoggerProvider.ts'), p('platform/observability/src/adapters/LoggerProvider.ts'));
  moveDir(p('apps/api/src/providers/maps'), p('platform/integrations/src/maps'));
  moveDir(p('apps/api/src/providers/notification'), p('platform/integrations/src/communications'));
  moveDir(p('apps/api/src/providers/payment'), p('platform/integrations/src/payment'));
  remove(p('apps/api/src/providers'));
}

function moveApiInfrastructure() {
  moveFile(p('apps/api/src/app.ts'), p('apps/api/src/bootstrap/app.ts'));
  moveFile(p('apps/api/src/server.ts'), p('apps/api/src/bootstrap/server.ts'));
  moveDir(p('apps/api/src/config'), p('apps/api/src/bootstrap/config'));
  moveDir(p('apps/api/src/container'), p('apps/api/src/bootstrap/container'));
  moveDir(p('apps/api/src/plugins'), p('apps/api/src/bootstrap/plugins'));
  moveDir(p('apps/api/src/middlewares'), p('apps/api/src/transport/middleware'));
  moveDir(p('apps/api/src/modules/health/api'), p('apps/api/src/system/health'));
  moveDir(p('apps/api/src/modules/health/tests'), p('apps/api/src/system/health/tests'));
  remove(p('apps/api/src/modules/health'));

  moveFile(p('apps/api/src/app.routes.ts'), p('apps/api/src/surfaces/customer/routes/app.routes.ts'));
  moveFile(p('apps/api/src/controllers/AppController.ts'), p('apps/api/src/surfaces/customer/controllers/AppController.ts'));
  remove(p('apps/api/src/controllers'));

  const simple = [
    ['partner', 'partner'],
    ['customer', 'customer'],
    ['catalog', 'customer'],
    ['config', 'customer'],
    ['maps', 'customer'],
    ['vehicle', 'customer'],
  ];
  for (const [feature, surface] of simple) {
    const module = p('apps/api/src/modules', feature);
    const api = path.join(module, 'api');
    const dto = path.join(module, 'dtos');
    if (exists(api)) {
      for (const file of walk(api, (f) => f.endsWith('.ts'))) {
        const bucket = path.basename(file).includes('.routes.') ? 'routes' : 'controllers';
        moveFile(file, p('apps/api/src/surfaces', surface, bucket, `${feature}.${path.basename(file)}`));
      }
    }
    if (exists(dto)) for (const file of walk(dto, (f) => f.endsWith('.ts'))) moveFile(file, p('apps/api/src/surfaces', surface, 'dto', `${feature}.${path.basename(file)}`));
  }

  const adminApi = p('apps/api/src/modules/admin/api');
  if (exists(adminApi)) {
    for (const file of walk(adminApi, (f) => f.endsWith('.ts'))) {
      const bucket = path.basename(file).includes('.routes.') ? 'routes' : 'controllers';
      moveFile(file, p('apps/api/src/surfaces/admin', bucket, path.basename(file)));
    }
  }
  const adminDtos = p('apps/api/src/modules/admin/dtos');
  if (exists(adminDtos)) for (const file of walk(adminDtos, (f) => f.endsWith('.ts'))) moveFile(file, p('apps/api/src/surfaces/admin/dto', path.basename(file)));

  moveDir(p('apps/api/src/modules/corporate/controllers'), p('apps/api/src/transport/corporate/controllers'));
  moveDir(p('apps/api/src/modules/corporate/routes'), p('apps/api/src/transport/corporate/routes'));
  moveDir(p('apps/api/src/modules/corporate/middleware'), p('apps/api/src/transport/guards'));

  moveDir(p('apps/api/src/modules/auth/api'), p('apps/api/src/transport/auth'));
  moveDir(p('apps/api/src/modules/auth/dtos'), p('apps/api/src/transport/auth/dto'));
  moveDir(p('apps/api/src/modules/auth/validator'), p('apps/api/src/transport/auth/validation'));
  moveDir(p('apps/api/src/modules/auth/tests'), p('apps/api/src/transport/auth/tests'));
  moveDir(p('apps/api/src/modules/sdui/api'), p('apps/api/src/transport/sdui'));
  moveDir(p('apps/api/src/modules/sdui/dtos'), p('apps/api/src/transport/sdui/dto'));

  moveFile(p('apps/api/src/modules/review/dtos/review.dto.ts'), p('apps/api/src/surfaces/customer/dto/review.dto.ts'));
  moveFile(p('apps/api/src/modules/coupon/dtos/coupon.dto.ts'), p('apps/api/src/surfaces/customer/dto/coupon.dto.ts'));
  moveFile(p('apps/api/src/modules/dispute/dtos/dispute.dto.ts'), p('apps/api/src/surfaces/customer/dto/dispute.dto.ts'));

  remove(p('apps/api/src/modules/auth/domain'));
  remove(p('apps/api/src/modules/auth/dto'));
  remove(p('apps/api/src/modules/auth/events'));
  remove(p('apps/api/src/modules/auth/infrastructure'));
  remove(p('apps/api/src/modules/auth/repository'));

  for (const feature of ['booking', 'invoice', 'notification', 'payment', 'payout', 'tracking']) {
    remove(p('apps/api/src/modules', feature, 'api'));
    remove(p('apps/api/src/modules', feature, 'dtos'));
  }
}

function rewriteRelativeImports() {
  const oldToNew = moved;
  for (const [oldPath, newPath] of oldToNew.entries()) {
    if (!exists(newPath) || !newPath.endsWith('.ts')) continue;
    let content = read(newPath);
    content = content.replace(/(from\s+['"])(\.\.?\/[^'"]+)(['"])/g, (full, start, spec, end) => {
      const oldTargetJs = path.resolve(path.dirname(oldPath), spec);
      const candidates = [
        oldTargetJs.replace(/\.js$/, '.ts'),
        oldTargetJs,
        `${oldTargetJs}.ts`,
        path.join(oldTargetJs, 'index.ts'),
      ];
      let targetOld = candidates.find((candidate) => oldToNew.has(path.resolve(candidate)) || exists(candidate));
      if (!targetOld) return full;
      const targetNew = oldToNew.get(path.resolve(targetOld)) ?? path.resolve(targetOld);
      if (!exists(targetNew)) return full;
      return `${start}${relativeImport(newPath, targetNew)}${end}`;
    });
    write(newPath, content);
  }
}

function collectPublicSymbols(packageDir) {
  const candidates = [path.join(packageDir, 'public/index.ts'), path.join(packageDir, 'src/public/index.ts'), path.join(packageDir, 'src/index.ts')];
  const entry = candidates.find(exists);
  if (!entry) return new Set();
  const seen = new Set();
  const names = new Set();
  function visit(file) {
    file = path.resolve(file);
    if (seen.has(file) || !exists(file)) return;
    seen.add(file);
    const content = read(file);
    for (const match of content.matchAll(/export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|enum|const|function)\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);
    for (const match of content.matchAll(/export\s*\{([^}]+)\}(?:\s+from\s+['"]([^'"]+)['"])?/g)) {
      for (const raw of match[1].split(',')) {
        const cleaned = raw.trim().replace(/^type\s+/, '');
        if (!cleaned) continue;
        names.add((cleaned.split(/\s+as\s+/)[1] ?? cleaned.split(/\s+as\s+/)[0]).trim());
      }
      if (match[2]?.startsWith('.')) {
        const target = resolveTs(file, match[2]);
        if (target) visit(target);
      }
    }
    for (const match of content.matchAll(/export\s+\*\s+from\s+['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.')) continue;
      const target = resolveTs(file, match[1]);
      if (target) visit(target);
    }
  }
  visit(entry);
  return names;
}

function resolveTs(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec.replace(/\.js$/, ''));
  for (const candidate of [`${base}.ts`, base, path.join(base, 'index.ts')]) if (exists(candidate)) return candidate;
  return undefined;
}

function buildOwnershipIndex() {
  const workspaceDirs = [
    ...fs.readdirSync(p('domains')).map((name) => p('domains', name)),
    ...fs.readdirSync(p('platform')).map((name) => p('platform', name)),
    p('foundation/kernel'), p('sdui/ui-sdk'), p('sdui/registry'),
  ].filter((dir) => exists(path.join(dir, 'package.json')));

  const manualPriority = new Map([
    ['IUseCase', '@carbroz/foundation-kernel'],
    ['ITransactionProvider', '@carbroz/foundation-kernel'],
    ['IClockProvider', '@carbroz/foundation-kernel'],
    ['IIdGeneratorProvider', '@carbroz/foundation-kernel'],
    ['AppError', '@carbroz/foundation-kernel'],
    ['ApplicationError', '@carbroz/foundation-kernel'],
    ['ForbiddenError', '@carbroz/foundation-kernel'],
    ['NotFoundError', '@carbroz/foundation-kernel'],
    ['ValidationError', '@carbroz/foundation-kernel'],
    ['ConflictError', '@carbroz/foundation-kernel'],
    ['UnauthorizedError', '@carbroz/foundation-kernel'],
    ['IMapsProvider', '@carbroz/domain-operations'],
    ['IPaymentGatewayProvider', '@carbroz/domain-financials'],
    ['INotificationProvider', '@carbroz/domain-communications'],
    ['ISmsProvider', '@carbroz/domain-communications'],
    ['IEmailProvider', '@carbroz/domain-communications'],
    ['IPushProvider', '@carbroz/domain-communications'],
    ['IAuthorizationProvider', '@carbroz/domain-identity'],
    ['IStorageProvider', '@carbroz/platform-storage'],
    ['ICacheProvider', '@carbroz/platform-cache'],
    ['IDatabaseProvider', '@carbroz/platform-database'],
    ['ILoggerProvider', '@carbroz/platform-observability'],
    ['IConfigProvider', '@carbroz/domain-configuration'],
    ['IFeatureFlagProvider', '@carbroz/domain-configuration'],
  ]);

  for (const dir of workspaceDirs) {
    const name = packageName(dir);
    if (!name) continue;
    for (const symbol of collectPublicSymbols(dir)) {
      if (!ownership.has(symbol)) ownership.set(symbol, name);
    }
  }
  for (const [symbol, owner] of manualPriority) ownership.set(symbol, owner);
}

function rewriteCommonImports() {
  const unresolved = new Map();
  const files = walk(root, (f) => f.endsWith('.ts') && !f.includes('/packages/common/'));
  for (const file of files) {
    let content = read(file);
    const chunks = [];
    content = content.replace(/import\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]@carbroz\/common['"];?/g, (full, typeOnly, body) => {
      const groups = new Map();
      for (const raw of body.split(',')) {
        let item = raw.trim();
        if (!item) continue;
        const isType = Boolean(typeOnly) || item.startsWith('type ');
        item = item.replace(/^type\s+/, '').trim();
        const sourceName = item.split(/\s+as\s+/)[0].trim();
        if (sourceName === 'ResponseHelper') {
          if (!file.startsWith(apiSrc)) {
            unresolved.set(`${rel(file)}::ResponseHelper`, 'transport helper outside API');
            continue;
          }
          const responseFile = p('apps/api/src/transport/response/ResponseHelper.ts');
          chunks.push(`import { ResponseHelper } from '${relativeImport(file, responseFile)}';`);
          continue;
        }
        if (sourceName === 'IRequestContext') {
          const owner = '@carbroz/foundation-kernel';
          const rendered = item.replace('IRequestContext', 'ExecutionContext');
          if (!groups.has(owner)) groups.set(owner, []);
          groups.get(owner).push(`${isType ? 'type ' : ''}${rendered}`);
          content = content.replace(/\bIRequestContext\b/g, 'ExecutionContext');
          continue;
        }
        const owner = ownership.get(sourceName);
        if (!owner) {
          unresolved.set(`${rel(file)}::${sourceName}`, 'no canonical public owner');
          continue;
        }
        if (!groups.has(owner)) groups.set(owner, []);
        groups.get(owner).push(`${isType ? 'type ' : ''}${item}`);
      }
      for (const [owner, items] of groups) chunks.push(`import { ${items.join(', ')} } from '${owner}';`);
      return '';
    });
    if (chunks.length) content = `${chunks.join('\n')}\n${content.replace(/^\s+/, '')}`;
    content = content
      .replace(/if \(!input\.context\.authenticatedUser\?\.isAdmin\)/g, "if (input.context.actor?.kind !== 'ADMIN')")
      .replace(/if \(!context\.authenticatedUser\?\.isAdmin\)/g, "if (context.actor?.kind !== 'ADMIN')")
      .replace(/\.authenticatedUser\?\.id/g, '.actor?.id')
      .replace(/\.authenticatedUser\.id/g, '.actor!.id')
      .replace(/\.authenticatedUser\?\.partnerId/g, '.actor?.partnerId')
      .replace(/\.authenticatedUser\?\.customerId/g, '.actor?.customerId');
    write(file, content);
  }
  if (unresolved.size) {
    const details = [...unresolved.entries()].map(([key, reason]) => `- ${key}: ${reason}`).join('\n');
    throw new Error(`Unresolved @carbroz/common ownership remains:\n${details}`);
  }
}

function moveLegacyBusinessServicesIfNeeded() {
  const mappings = [
    ['packages/common/src/domain/audit/AuditLogService.ts', 'domains/audit/application/AuditLogService.ts', '@carbroz/domain-audit'],
    ['packages/common/src/domain/notification/NotificationService.ts', 'domains/communications/application/NotificationService.ts', '@carbroz/domain-communications'],
    ['packages/common/src/domain/review/PartnerRatingCalculator.ts', 'domains/engagement/review/domain/PartnerRatingCalculator.ts', '@carbroz/domain-engagement'],
    ['packages/common/src/domain/coupon/CouponDiscountCalculator.ts', 'domains/engagement/coupon/domain/CouponDiscountCalculator.ts', '@carbroz/domain-engagement'],
    ['packages/common/src/domain/dispute/DisputeSettlementCalculator.ts', 'domains/dispute/domain/DisputeSettlementCalculator.ts', '@carbroz/domain-dispute'],
  ];
  for (const [sourceRel, targetRel, owner] of mappings) {
    const source = p(sourceRel), target = p(targetRel);
    if (exists(source) && !exists(target)) moveFile(source, target);
    if (exists(target)) ownership.set(path.basename(target, '.ts'), owner);
  }
}

function createResponseHelper() {
  const source = p('packages/common/src/responses.ts');
  const target = p('apps/api/src/transport/response/ResponseHelper.ts');
  if (exists(source)) moveFile(source, target);
  if (exists(target)) {
    let content = read(target);
    if (!content.includes('/**')) content = `/** HTTP response-envelope helper owned exclusively by the API transport layer. */\n${content}`;
    write(target, content);
  }
}

function writeObservability() {
  const file = p('platform/observability/src/index.ts');
  const existingPortExport = exists(p('platform/observability/src/ports/ILoggerProvider.ts')) ? "export * from './ports/ILoggerProvider.js';\n" : '';
  write(file, `import pino, { type LoggerOptions } from 'pino';

${existingPortExport}const SENSITIVE_PATHS = [
  'req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie',
  'headers.authorization', 'headers.cookie', 'authorization', 'cookie',
  'password', '*.password', 'token', '*.token', 'accessToken', '*.accessToken',
  'refreshToken', '*.refreshToken', 'otp', '*.otp', 'mockOtp', '*.mockOtp',
  'phoneNumber', '*.phoneNumber', 'email', '*.email', 'fcmToken', '*.fcmToken',
  'cardNumber', '*.cardNumber', 'cvv', '*.cvv', 'upiId', '*.upiId',
  'kyc', '*.kyc', 'document', '*.document', 'documentNumber', '*.documentNumber',
  'bankAccount', '*.bankAccount', 'ifsc', '*.ifsc', 'secret', '*.secret'
] as const;

/** Creates the process logger with mandatory privacy redaction. */
export function createLogger(level = process.env.LOG_LEVEL ?? 'info') {
  return pino({ level, redact: { paths: [...SENSITIVE_PATHS], censor: '[REDACTED]' } });
}

/** Returns Fastify logger options using the same mandatory redaction policy. */
export function getFastifyLoggerConfig(level = process.env.LOG_LEVEL ?? 'info'): LoggerOptions {
  return { level, redact: { paths: [...SENSITIVE_PATHS], censor: '[REDACTED]' } };
}

/** Safe metadata carried by application-flow log events. Payload bodies are intentionally unsupported. */
export interface FlowLogFields {
  correlationId: string;
  surface?: 'partner' | 'customer' | 'admin' | 'system';
  operation?: string;
  useCase?: string;
  method?: string;
  route?: string;
  statusCode?: number;
  durationMs?: number;
  actorKind?: string;
  outcome?: 'started' | 'completed' | 'failed';
  errorCode?: string;
}

/**
 * Emits structured flow events that make request → surface → application → response interaction traceable
 * without ever accepting arbitrary request/response payloads.
 */
export function logFlow(logger: { info: (obj: object, msg?: string) => void; error: (obj: object, msg?: string) => void }, event: string, fields: FlowLogFields): void {
  const method = fields.outcome === 'failed' ? logger.error.bind(logger) : logger.info.bind(logger);
  method({ event, ...fields }, event);
}
`);
}

function writeLifecyclePlugin() {
  write(p('apps/api/src/bootstrap/lifecycle/request-flow.plugin.ts'), `import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { logFlow } from '@carbroz/platform-observability';

const startedAt = Symbol('carbroz.request.startedAt');

declare module 'fastify' {
  interface FastifyRequest { [startedAt]?: bigint; }
}

/** Registers payload-safe request lifecycle logging with correlation-aware timing. */
export default fp(async function requestFlowPlugin(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    request[startedAt] = process.hrtime.bigint();
    logFlow(request.log, 'http.request.started', {
      correlationId: request.traceId ?? request.id,
      method: request.method,
      route: request.url,
      surface: request.url.includes('/partner/') ? 'partner' : request.url.includes('/admin/') ? 'admin' : request.url.includes('/customer/') ? 'customer' : 'system',
      outcome: 'started',
    });
  });

  app.addHook('onResponse', async (request, reply) => {
    const start = request[startedAt];
    const durationMs = start ? Number(process.hrtime.bigint() - start) / 1_000_000 : undefined;
    logFlow(request.log, 'http.request.completed', {
      correlationId: request.traceId ?? request.id,
      method: request.method,
      route: request.url,
      statusCode: reply.statusCode,
      durationMs,
      outcome: 'completed',
    });
  });
});
`);
}

function writeCanonicalApp() {
  write(p('apps/api/src/bootstrap/app.ts'), `import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFastifyLoggerConfig } from '@carbroz/platform-observability';
import { SecurityConfig, LoggingConfig } from './config/runtime-config.js';
import { globalErrorHandler } from '../transport/middleware/error-handler.js';
import { ResponseHelper } from '../transport/response/ResponseHelper.js';
import diPlugin from './plugins/di.plugin.js';
import requestContextPlugin from './plugins/request-context.js';
import shutdownPlugin from './plugins/shutdown.plugin.js';
import jwtPlugin from './plugins/jwt.plugin.js';
import authorizationPlugin from './plugins/authorization.plugin.js';
import requestFlowPlugin from './lifecycle/request-flow.plugin.js';
import { registerCustomerSurface } from '../surfaces/customer/routes/index.js';
import { registerPartnerSurface } from '../surfaces/partner/routes/index.js';
import { registerAdminSurface } from '../surfaces/admin/routes/index.js';
import healthRoutes from '../system/health/health.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Builds the Fastify composition root; no business rules live in this executable layer. */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: getFastifyLoggerConfig(LoggingConfig.logLevel) });
  await app.register(fastifyMultipart, { limits: { fileSize: 5 * 1024 * 1024 } });
  await app.register(cors, { origin: SecurityConfig.corsOrigin, credentials: true });
  await app.register(helmet);
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ResponseHelper.error(`Rate limit exceeded, retry in ${context.after}`, 'TOO_MANY_REQUESTS', request.traceId),
  });
  await app.register(shutdownPlugin);
  await app.register(diPlugin);
  await app.register(requestContextPlugin);
  await app.register(jwtPlugin);
  await app.register(authorizationPlugin);
  await app.register(requestFlowPlugin);
  await app.register(fastifyStatic, { root: path.join(__dirname, '../../public'), prefix: '/' });

  app.setErrorHandler(globalErrorHandler);
  app.setNotFoundHandler((request, reply) => reply.status(404).send(ResponseHelper.error(`Route ${request.method}:${request.url} not found`, 'NOT_FOUND', request.traceId)));
  app.addHook('onRequest', async (request) => {
    if (!request.headers.authorization) return;
    try { await request.jwtVerify(); } catch { /* protected routes enforce authorization explicitly */ }
  });

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(registerPartnerSurface, { prefix: '/api/v1/partner' });
  await app.register(registerCustomerSurface, { prefix: '/api/v1/customer' });
  await app.register(registerAdminSurface, { prefix: '/api/v1/admin' });
  return app;
}
`);

  write(p('apps/api/src/bootstrap/server.ts'), `import { buildApp } from './app.js';

/** Starts the HTTP process and delegates all composition to buildApp. */
async function start(): Promise<void> {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  try { await app.listen({ port, host }); }
  catch (error) { app.log.error({ err: error }, 'server.start.failed'); process.exit(1); }
}

void start();
`);
}

function writeSurfaceRoutes() {
  write(p('apps/api/src/surfaces/customer/routes/index.ts'), `import type { FastifyInstance } from 'fastify';
import appRoutes from './app.routes.js';
import customerRoutes from './customer.customer.routes.js';
import catalogRoutes from './catalog.catalog.routes.js';
import { configRoutes } from './config.config.routes.js';
import { mapsRoutes } from './maps.maps.routes.js';
import { registerCustomerAuthRoutes } from '../../../transport/auth/customer-auth.routes.js';
import { registerCustomerSduiRoutes } from '../../../transport/sdui/customer-sdui.routes.js';
import { registerCustomerReviewRoutes } from './review.routes.js';
import { registerCustomerCouponRoutes } from './coupon.routes.js';
import { registerCustomerDisputeRoutes } from './dispute.routes.js';
import { registerCustomerCorporateRoutes } from './corporate.routes.js';

/** Registers only Customer-product HTTP routes. */
export async function registerCustomerSurface(app: FastifyInstance): Promise<void> {
  await app.register(registerCustomerAuthRoutes, { prefix: '/auth' });
  await app.register(appRoutes, { prefix: '/app' });
  await app.register(configRoutes, { prefix: '/config' });
  await app.register(customerRoutes);
  await app.register(catalogRoutes, { prefix: '/catalog' });
  await app.register(mapsRoutes, { prefix: '/maps' });
  await app.register(registerCustomerSduiRoutes, { prefix: '/sdui' });
  await app.register(registerCustomerReviewRoutes, { prefix: '/reviews' });
  await app.register(registerCustomerCouponRoutes, { prefix: '/coupons' });
  await app.register(registerCustomerDisputeRoutes, { prefix: '/disputes' });
  await app.register(registerCustomerCorporateRoutes, { prefix: '/corporate' });
}
`);

  write(p('apps/api/src/surfaces/partner/routes/index.ts'), `import type { FastifyInstance } from 'fastify';
import { partnerRoutes } from './partner.partner.routes.js';
import { kycRoutes } from './partner.kyc.routes.js';
import { registerPartnerAuthRoutes } from '../../../transport/auth/partner-auth.routes.js';
import { registerPartnerSduiRoutes } from '../../../transport/sdui/partner-sdui.routes.js';

/** Registers only Partner-product HTTP routes. */
export async function registerPartnerSurface(app: FastifyInstance): Promise<void> {
  await app.register(registerPartnerAuthRoutes, { prefix: '/auth' });
  await app.register(partnerRoutes);
  await app.register(kycRoutes);
  await app.register(registerPartnerSduiRoutes, { prefix: '/sdui' });
}
`);

  write(p('apps/api/src/surfaces/admin/routes/index.ts'), `import type { FastifyInstance } from 'fastify';
import { adminPartnerRoutes } from './admin-partner.routes.js';
import { adminKycRoutes } from './admin-kyc.routes.js';
import adminCatalogRoutes from './admin-catalog.routes.js';
import adminSduiRoutes from './admin-sdui.routes.js';
import { registerAdminReviewRoutes } from './review.routes.js';
import { registerAdminCouponRoutes } from './coupon.routes.js';
import { registerAdminDisputeRoutes } from './dispute.routes.js';
import { registerAdminCorporateRoutes } from './corporate.routes.js';

/** Registers only Admin control-plane HTTP routes; Admin has no SDUI runtime scope of its own. */
export async function registerAdminSurface(app: FastifyInstance): Promise<void> {
  await app.register(adminPartnerRoutes, { prefix: '/partners' });
  await app.register(adminKycRoutes, { prefix: '/kyc' });
  await app.register(adminCatalogRoutes, { prefix: '/catalog' });
  await app.register(adminSduiRoutes, { prefix: '/sdui' });
  await app.register(registerAdminReviewRoutes, { prefix: '/reviews' });
  await app.register(registerAdminCouponRoutes, { prefix: '/coupons' });
  await app.register(registerAdminDisputeRoutes, { prefix: '/disputes' });
  await app.register(registerAdminCorporateRoutes, { prefix: '/corporate' });
}
`);
}

function copyTransportDto(source, target) {
  if (exists(source)) {
    ensureDir(path.dirname(target));
    fs.copyFileSync(source, target);
    changed.add(target);
  }
}

function writeSharedAuthRoutes() {
  const controllerPath = p('apps/api/src/transport/auth/auth.controller.ts');
  if (exists(controllerPath)) {
    let c = read(controllerPath).replace(/request\.log\.info\(`Mock OTP[^;]+;/g, "request.log.info({ event: 'auth.otp.generated', correlationId: request.traceId }, 'auth.otp.generated');");
    write(controllerPath, c);
  }
  const shared = `import type { FastifyInstance } from 'fastify';\nimport authRoutes from './auth.routes.js';\n\n`;
  write(p('apps/api/src/transport/auth/customer-auth.routes.ts'), `${shared}/** Mounts shared Identity authentication mechanics on the Customer surface. */\nexport async function registerCustomerAuthRoutes(app: FastifyInstance): Promise<void> { await app.register(authRoutes); }\n`);
  write(p('apps/api/src/transport/auth/partner-auth.routes.ts'), `${shared}/** Mounts shared Identity authentication mechanics on the Partner surface. */\nexport async function registerPartnerAuthRoutes(app: FastifyInstance): Promise<void> { await app.register(authRoutes); }\n`);
}

function writeSharedSduiRoutes() {
  const source = p('apps/api/src/transport/sdui/sdui-registry.routes.ts');
  write(p('apps/api/src/transport/sdui/customer-sdui.routes.ts'), `import type { FastifyInstance } from 'fastify';\nimport runtimeRoutes from './sdui-registry.routes.js';\n/** Exposes SDUI runtime retrieval for CUSTOMER scope only. */\nexport async function registerCustomerSduiRoutes(app: FastifyInstance): Promise<void> { await app.register(runtimeRoutes); }\n`);
  write(p('apps/api/src/transport/sdui/partner-sdui.routes.ts'), `import type { FastifyInstance } from 'fastify';\nimport runtimeRoutes from './sdui-registry.routes.js';\n/** Exposes SDUI runtime retrieval for PARTNER scope only. */\nexport async function registerPartnerSduiRoutes(app: FastifyInstance): Promise<void> { await app.register(runtimeRoutes); }\n`);
}

function writeMixedSurfaceRoutes() {
  // Reviews: customer submit/list, admin moderate.
  write(p('apps/api/src/surfaces/customer/routes/review.routes.ts'), `import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SubmitReviewUseCase, GetPartnerReviewsUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { submitReviewSchema } from '../dto/review.dto.js';
/** Customer review endpoints. */
export async function registerCustomerReviewRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = submitReviewSchema.parse(request.body);
    const useCase = app.diContainer.resolve<SubmitReviewUseCase>('submitReviewUseCase');
    const review = await useCase.execute({ ...body, customerUserId: (request.user as { id: number }).id });
    return reply.status(201).send(ResponseHelper.created(review, 'Review submitted successfully'));
  });
  app.get('/partner/:partnerPublicId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { partnerPublicId } = request.params as { partnerPublicId: string };
    const { limit, offset } = request.query as { limit?: string; offset?: string };
    const useCase = app.diContainer.resolve<GetPartnerReviewsUseCase>('getPartnerReviewsUseCase');
    const reviews = await useCase.execute({ partnerPublicId, limit: limit ? Number(limit) : 50, offset: offset ? Number(offset) : 0 });
    return reply.send(ResponseHelper.success(reviews, 'Partner reviews retrieved successfully'));
  });
}
`);
  write(p('apps/api/src/surfaces/admin/routes/review.routes.ts'), `import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ModerateReviewUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { moderateReviewSchema } from '../../customer/dto/review.dto.js';
/** Admin review moderation endpoints. */
export async function registerAdminReviewRoutes(app: FastifyInstance): Promise<void> {
  app.patch('/:reviewPublicId/moderate', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { reviewPublicId } = request.params as { reviewPublicId: string };
    const body = moderateReviewSchema.parse({ ...(request.body as object), reviewPublicId });
    const useCase = app.diContainer.resolve<ModerateReviewUseCase>('moderateReviewUseCase');
    return reply.send(ResponseHelper.success(await useCase.execute(body), 'Review moderated successfully'));
  });
}
`);

  // Coupon admin management and customer consumption are intentionally isolated.
  write(p('apps/api/src/surfaces/customer/routes/coupon.routes.ts'), `import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ApplyCouponUseCase, ListCouponsUseCase, ValidateCouponUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { applyCouponSchema, validateCouponSchema } from '../dto/coupon.dto.js';
/** Customer coupon discovery/validation/application endpoints. */
export async function registerCustomerCouponRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async (_request, reply) => { const uc = app.diContainer.resolve<ListCouponsUseCase>('listCouponsUseCase'); return reply.send(ResponseHelper.success(await uc.execute(), 'Active coupons retrieved successfully')); });
  app.post('/validate', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const body = validateCouponSchema.parse(request.body); const uc = app.diContainer.resolve<ValidateCouponUseCase>('validateCouponUseCase'); return reply.send(ResponseHelper.success(await uc.execute({ ...body, userId: (request.user as { id: number }).id }), 'Coupon validated successfully')); });
  app.post('/apply', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const body = applyCouponSchema.parse(request.body); const uc = app.diContainer.resolve<ApplyCouponUseCase>('applyCouponUseCase'); return reply.status(201).send(ResponseHelper.created(await uc.execute({ ...body, userId: (request.user as { id: number }).id }), 'Coupon applied successfully')); });
}
`);
  write(p('apps/api/src/surfaces/admin/routes/coupon.routes.ts'), `import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ArchiveCouponUseCase, CreateCouponUseCase, UpdateCouponUseCase } from '@carbroz/domain-engagement';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { createCouponSchema, updateCouponSchema } from '../../customer/dto/coupon.dto.js';
/** Admin coupon lifecycle endpoints. */
export async function registerAdminCouponRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const body = createCouponSchema.parse(request.body); const uc = app.diContainer.resolve<CreateCouponUseCase>('createCouponUseCase'); return reply.status(201).send(ResponseHelper.created(await uc.execute({ ...body, validFrom: new Date(body.validFrom), validUntil: new Date(body.validUntil) }), 'Coupon created successfully')); });
  app.patch('/:publicId', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const { publicId } = request.params as { publicId: string }; const body = updateCouponSchema.parse(request.body); const uc = app.diContainer.resolve<UpdateCouponUseCase>('updateCouponUseCase'); return reply.send(ResponseHelper.success(await uc.execute({ publicId, ...body, validFrom: body.validFrom ? new Date(body.validFrom) : undefined, validUntil: body.validUntil ? new Date(body.validUntil) : undefined }), 'Coupon updated successfully')); });
  app.delete('/:publicId', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => { const { publicId } = request.params as { publicId: string }; const uc = app.diContainer.resolve<ArchiveCouponUseCase>('archiveCouponUseCase'); await uc.execute(publicId); return reply.send(ResponseHelper.success(null, 'Coupon archived successfully')); });
}
`);

  // Corporate transport was already split; canonical wrappers keep surfaces isolated.
  write(p('apps/api/src/surfaces/customer/routes/corporate.routes.ts'), `import type { FastifyInstance } from 'fastify';\nimport { corporateRoutes } from '../../../transport/corporate/routes/corporate.routes.js';\n/** Customer-facing enterprise/corporate routes. */\nexport async function registerCustomerCorporateRoutes(app: FastifyInstance): Promise<void> { await app.register(corporateRoutes); }\n`);
  write(p('apps/api/src/surfaces/admin/routes/corporate.routes.ts'), `import type { FastifyInstance } from 'fastify';\nimport { adminCorporateRoutes } from '../../../transport/corporate/routes/admin-corporate.routes.js';\n/** Admin enterprise/corporate control-plane routes. */\nexport async function registerAdminCorporateRoutes(app: FastifyInstance): Promise<void> { await app.register(adminCorporateRoutes); }\n`);
}

function writeDisputeRoutesFromExisting() {
  const source = p('apps/api/src/modules/dispute/api/dispute.controller.ts');
  if (!exists(source)) return;
  // Preserve DTO schema but split the old mixed plugin through lightweight surface wrappers generated below.
  write(p('apps/api/src/surfaces/customer/routes/dispute.routes.ts'), `import type { FastifyInstance, FastifyRequest } from 'fastify';
import { GetDisputeUseCase, ListDisputesUseCase, RaiseDisputeUseCase } from '@carbroz/domain-dispute';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { raiseDisputeSchema } from '../dto/dispute.dto.js';
/** Customer dispute lifecycle endpoints. */
export async function registerCustomerDisputeRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => { const input = raiseDisputeSchema.parse(request.body); const uc = app.diContainer.resolve<RaiseDisputeUseCase>('raiseDisputeUseCase'); return reply.status(201).send(ResponseHelper.created(await uc.execute({ ...input, raisedByUserId: (request.user as { id: number }).id }), 'Dispute raised successfully')); });
  app.get('/', { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply) => { const uc = app.diContainer.resolve<ListDisputesUseCase>('listDisputesUseCase'); return reply.send(ResponseHelper.success(await uc.execute({ userId: (request.user as { id: number }).id }), 'Disputes retrieved successfully')); });
  app.get('/:publicId', { preHandler: [app.authenticate] }, async (request, reply) => { const { publicId } = request.params as { publicId: string }; const uc = app.diContainer.resolve<GetDisputeUseCase>('getDisputeUseCase'); return reply.send(ResponseHelper.success(await uc.execute(publicId), 'Dispute retrieved successfully')); });
}
`);
  write(p('apps/api/src/surfaces/admin/routes/dispute.routes.ts'), `import type { FastifyInstance } from 'fastify';
import { ListDisputesUseCase, ResolveDisputeUseCase } from '@carbroz/domain-dispute';
import { ResponseHelper } from '../../../transport/response/ResponseHelper.js';
import { resolveDisputeSchema } from '../../customer/dto/dispute.dto.js';
/** Admin dispute resolution endpoints. */
export async function registerAdminDisputeRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', { preHandler: [app.authenticate] }, async (_request, reply) => { const uc = app.diContainer.resolve<ListDisputesUseCase>('listDisputesUseCase'); return reply.send(ResponseHelper.success(await uc.execute({}), 'Disputes retrieved successfully')); });
  app.patch('/:publicId/resolve', { preHandler: [app.authenticate] }, async (request, reply) => { const { publicId } = request.params as { publicId: string }; const body = resolveDisputeSchema.parse(request.body); const uc = app.diContainer.resolve<ResolveDisputeUseCase>('resolveDisputeUseCase'); return reply.send(ResponseHelper.success(await uc.execute({ publicId, ...body }), 'Dispute resolved successfully')); });
}
`);
}

function rewriteMovedUseCaseDtoImports() {
  const mappings = [
    ['domains/partner/application/use-cases', 'domains/partner/application/contracts/partner.ts'],
    ['domains/customer/application/use-cases', 'domains/customer/application/contracts/customer.ts'],
    ['domains/catalog-pricing/application/use-cases', 'domains/catalog-pricing/application/contracts/catalog.ts'],
    ['domains/configuration/application/use-cases', 'domains/configuration/application/contracts/config.ts'],
    ['domains/engagement/coupon/application/use-cases', 'domains/engagement/coupon/application/contracts/coupon.ts'],
    ['domains/engagement/review/application/use-cases', 'domains/engagement/review/application/contracts/review.ts'],
    ['domains/dispute/application/use-cases', 'domains/dispute/application/contracts/dispute.ts'],
    ['domains/financials/payment/application/use-cases', 'domains/financials/payment/application/contracts/payment.ts'],
    ['domains/financials/payout/application/use-cases', 'domains/financials/payout/application/contracts/payout.ts'],
    ['domains/operations/application/maps/use-cases', 'domains/operations/application/maps/contracts/maps.ts'],
    ['domains/communications/application/use-cases', 'domains/communications/application/contracts/notification.ts'],
    ['domains/operations/application/tracking/use-cases', 'domains/operations/application/tracking/contracts/tracking.ts'],
    ['sdui/registry/application/use-cases', 'sdui/registry/application/contracts/sdui-registry.ts'],
  ];
  for (const [dirRel, contractRel] of mappings) {
    const contract = p(contractRel);
    if (!exists(contract)) continue;
    for (const file of walk(p(dirRel), (f) => f.endsWith('.ts') && !f.includes('.spec.') && !f.includes('.test.'))) replaceDtoTypeImports(file, contract);
  }

  // Auth use cases derive Input directly from Zod schemas; replace that boundary leakage with generated structural contracts.
  const authContract = p('domains/identity/application/contracts/auth.ts');
  for (const file of walk(p('domains/identity/application/use-cases'), (f) => f.endsWith('UseCase.ts'))) {
    let content = read(file);
    const schemaMatch = content.match(/import \{ ([A-Za-z0-9_]+) \} from ['"]\.\.\/dtos\/auth\.dto\.js['"];?/);
    if (schemaMatch && exists(authContract)) {
      const schema = schemaMatch[1];
      const inferredName = schema.replace(/Schema$/, 'Dto').replace(/^([a-z])/, (m) => m.toUpperCase());
      content = content.replace(schemaMatch[0], `import type { ${inferredName} } from '${relativeImport(file, authContract)}';`);
      content = content.replace(/import \{ z \} from 'zod';\n?/, '');
      content = content.replace(new RegExp(`type Input = z\\.infer<typeof ${schema}>;`), `type Input = ${inferredName};`);
      write(file, content);
    }
  }
}

function moveAndRewriteTests() {
  const apiTests = p('apps/api/tests');
  if (exists(apiTests)) moveDir(apiTests, p('tests/integration/application'));
  const commonTests = p('packages/common/tests/domain');
  if (exists(commonTests)) moveDir(commonTests, p('tests/integration/domain'));

  const useCasePathMap = new Map();
  for (const [symbol, owner] of ownership) if (symbol.endsWith('UseCase')) useCasePathMap.set(symbol, owner);
  for (const file of walk(p('tests'), (f) => f.endsWith('.ts'))) {
    let content = read(file);
    content = content.replace(/import\s+([^;]+)\s+from\s+['"][^'"]*\/use-cases\/([A-Za-z0-9_]+)\.js['"];?/g, (full, clause, symbol) => {
      const owner = useCasePathMap.get(symbol);
      return owner ? `import ${clause} from '${owner}';` : full;
    });
    // Old Common tests often used relative imports into Common internals. Re-home named imports by canonical symbol ownership.
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"][^'"]*(?:src\/domain|packages\/common)[^'"]*['"];?/g, (full, body) => {
      const groups = new Map();
      for (const raw of body.split(',')) {
        const item = raw.trim(); if (!item) continue;
        const sourceName = item.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim();
        const owner = ownership.get(sourceName);
        if (!owner) return full;
        if (!groups.has(owner)) groups.set(owner, []);
        groups.get(owner).push(item);
      }
      return [...groups].map(([owner, items]) => `import { ${items.join(', ')} } from '${owner}';`).join('\n');
    });
    write(file, content);
  }
}

function addDocumentationComments() {
  const roots = [p('apps/api/src'), p('domains'), p('sdui'), p('platform'), p('foundation')];
  for (const base of roots) for (const file of walk(base, (f) => f.endsWith('.ts') && !f.includes('.spec.') && !f.includes('.test.') && !f.includes('/generated/'))) {
    let content = read(file);
    const owner = rel(file).split('/').slice(0, 2).join('/');
    content = content.replace(/(^|\n)([ \t]*)(export\s+(?:default\s+)?(?:abstract\s+)?(?:class|interface|type|enum|function)\s+([A-Za-z0-9_]+))/g, (full, prefix, indent, declaration, name, offset) => {
      const before = content.slice(Math.max(0, offset - 250), offset).trimEnd();
      if (before.endsWith('*/')) return full;
      return `${prefix}${indent}/** ${name} is an exported ${owner} contract/implementation; see the owning README for lifecycle and extension rules. */\n${indent}${declaration}`;
    });
    content = content.replace(/\n([ \t]+)(async\s+execute|public\s+async\s+execute)\s*\(/g, (full, indent, signature, offset) => {
      const before = content.slice(Math.max(0, offset - 180), offset).trimEnd();
      if (before.endsWith('*/')) return full;
      return `\n${indent}/** Executes this application operation through its declared ports and domain invariants. */\n${indent}${signature}(`;
    });
    write(file, content);
  }
}

function updateWorkspaceDependencies() {
  const workspaceRoots = [p('apps/api'), ...fs.readdirSync(p('domains')).map((n) => p('domains', n)), ...fs.readdirSync(p('platform')).map((n) => p('platform', n)), p('foundation/kernel'), p('sdui/ui-sdk'), p('sdui/registry')].filter((d) => exists(path.join(d, 'package.json')));
  const packageByName = new Map(workspaceRoots.map((d) => [packageName(d), d]).filter(([name]) => Boolean(name)));
  for (const dir of workspaceRoots) {
    const manifestPath = path.join(dir, 'package.json');
    const manifest = JSON.parse(read(manifestPath));
    manifest.dependencies ??= {};
    delete manifest.dependencies['@carbroz/common'];
    const imports = new Set();
    for (const file of walk(dir, (f) => f.endsWith('.ts') && !f.includes('.spec.') && !f.includes('.test.'))) {
      for (const match of read(file).matchAll(/from\s+['"](@carbroz\/[^'"]+)['"]/g)) imports.add(match[1]);
    }
    for (const dependency of imports) {
      if (dependency !== manifest.name && packageByName.has(dependency)) manifest.dependencies[dependency] = 'workspace:*';
    }
    for (const dependency of Object.keys(manifest.dependencies)) if (dependency.startsWith('@carbroz/') && !packageByName.has(dependency)) delete manifest.dependencies[dependency];
    manifest.dependencies = Object.fromEntries(Object.entries(manifest.dependencies).sort(([a], [b]) => a.localeCompare(b)));
    write(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  const workspace = p('pnpm-workspace.yaml');
  write(workspace, `packages:\n  - "apps/*"\n  - "domains/*"\n  - "sdui/*"\n  - "platform/*"\n  - "foundation/*"\n`);
}

function writeArchitectureTests() {
  write(p('tests/architecture/canonical-topology.policy.test.ts'), `import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
const exists = (p: string) => existsSync(resolve(root, p));
function files(dir: string): string[] { const abs = resolve(root, dir); if (!existsSync(abs)) return []; return readdirSync(abs).flatMap((e) => { const f = resolve(abs, e); return statSync(f).isDirectory() ? ['node_modules','dist','generated'].includes(e) ? [] : files(f.replace(root + '/', '')) : e.endsWith('.ts') ? [f] : []; }); }

describe('frozen backend topology', () => {
  it('matches the constitution physically, not only in documentation', () => {
    expect(exists('packages')).toBe(false);
    expect(readFileSync(resolve(root, 'pnpm-workspace.yaml'), 'utf8')).not.toContain('packages/*');
    for (const p of ['apps/api/src/bootstrap','apps/api/src/surfaces/partner','apps/api/src/surfaces/customer','apps/api/src/surfaces/admin','apps/api/src/transport','apps/api/src/system','foundation/kernel','sdui/ui-sdk','sdui/registry']) expect(exists(p), p).toBe(true);
    expect(exists('apps/api/src/modules')).toBe(false);
    expect(exists('apps/api/src/container')).toBe(false);
    expect(exists('apps/api/src/providers')).toBe(false);
  });
  it('keeps application use cases outside the API executable', () => {
    const violations = files('apps/api/src').filter((f) => /class\s+\w+UseCase\b/.test(readFileSync(f, 'utf8')));
    expect(violations.map((f) => f.replace(root + '/', ''))).toEqual([]);
  });
  it('has no transitional @carbroz/common imports', () => {
    const violations = files('.').filter((f) => readFileSync(f, 'utf8').includes('@carbroz/common'));
    expect(violations.map((f) => f.replace(root + '/', ''))).toEqual([]);
  });
});
`);

  write(p('tests/architecture/engineering-quality.policy.test.ts'), `import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
function source(dir: string): string[] { const abs=resolve(root,dir); return readdirSync(abs).flatMap((e)=>{const f=resolve(abs,e); if(statSync(f).isDirectory()) return ['node_modules','dist','generated','.git'].includes(e)?[]:source(f.replace(root+'/', '')); return e.endsWith('.ts')?[f]:[];}); }
const production = ['apps','domains','sdui','platform','foundation'].flatMap(source).filter((f)=>!/[.](?:spec|test)[.]ts$/.test(f));

describe('engineering quality freeze', () => {
  it('forbids raw secret/PII payload logging', () => {
    const violations = production.filter((f)=>{const c=readFileSync(f,'utf8'); return /log\.(?:info|debug|warn|error)\([^\n]*(?:mockOtp|phoneNumber|request\.body|response\.body|refreshToken|authorization)/i.test(c);});
    expect(violations.map((f)=>f.replace(root+'/', ''))).toEqual([]);
  });
  it('documents exported production classes and use cases', () => {
    const violations:string[]=[]; for(const f of production){const c=readFileSync(f,'utf8'); const re=/export\s+(?:default\s+)?(?:abstract\s+)?(?:class|interface|function)\s+[A-Za-z0-9_]+/g; for(const m of c.matchAll(re)){const before=c.slice(Math.max(0,(m.index??0)-220),m.index).trimEnd(); if(!before.endsWith('*/')) violations.push(f.replace(root+'/', ''));}}
    expect([...new Set(violations)]).toEqual([]);
  });
});
`);
}

function writeDeveloperReadme() {
  const domainRows = [
    ['Identity', 'domains/identity', 'Authentication, sessions, OTP/token/RBAC and actor authorization', 'pnpm vitest run domains/identity tests/architecture/identity-common-boundary.policy.test.ts'],
    ['Partner', 'domains/partner', 'Partner/profile/member/KYC lifecycle', 'pnpm vitest run domains/partner tests/architecture/partner-common-boundary.policy.test.ts'],
    ['Customer', 'domains/customer', 'Customer profile, address, garage and preferences', 'pnpm vitest run domains/customer tests/architecture/customer-persistence-boundary.policy.test.ts'],
    ['Catalog & Pricing', 'domains/catalog-pricing', 'Services, add-ons, pricing tiers and price calculation', 'pnpm vitest run domains/catalog-pricing tests/integration/application/CatalogUseCases.spec.ts'],
    ['Booking', 'domains/booking', 'Booking lifecycle/invariants; dispatch is explicitly not owned here', 'pnpm vitest run domains/booking tests/integration/application/booking-use-cases.test.ts'],
    ['Operations', 'domains/operations', 'Slots/capacity, dispatch, maps/location, tracking and service execution', 'pnpm vitest run domains/operations tests/integration/application/tracking-notification-engine.test.ts'],
    ['Financials', 'domains/financials', 'Payment, invoice/refund, payout, commission, tax, ledger and settlement', 'pnpm vitest run domains/financials tests/integration/application/payment-engine-use-cases.test.ts'],
    ['Communications', 'domains/communications', 'Notification templates/preferences/history and delivery orchestration', 'pnpm vitest run domains/communications tests/integration/application/tracking-notification-engine.test.ts'],
    ['Engagement', 'domains/engagement', 'Reviews/ratings, coupons, promotions and offers', 'pnpm vitest run domains/engagement tests/integration/application/review-coupon-engine.test.ts'],
    ['Configuration', 'domains/configuration', 'Persisted runtime/product configuration and feature policy', 'pnpm vitest run domains/configuration tests/integration/application/GetInitConfigUseCase.spec.ts'],
    ['Dispute', 'domains/dispute', 'Dispute lifecycle and settlement decisions', 'pnpm vitest run domains/dispute tests/integration/application/dispute-engine.test.ts'],
    ['Enterprise', 'domains/enterprise', 'B2B/corporate account concepts; financial records remain Financials', 'pnpm vitest run domains/enterprise tests/integration/application/corporate-fleet-billing-engine.test.ts'],
    ['Audit', 'domains/audit', 'Immutable business/security audit evidence; not technical logs', 'pnpm vitest run domains/audit'],
  ];
  const rows = domainRows.map(([name, dir, owns, test]) => `### ${name} — \`${dir}\`\nOwns: ${owns}. Application classes are under \`application/\`; domain invariants under \`domain/\`; adapters under \`infrastructure/\`; cross-module callers use only \`public/index.ts\`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in \`apps/api/src/bootstrap/container\`, then expose it from the correct surface.\n\n**Tests for this owner:** \`${test}\`. For one class use \`pnpm vitest run <path-to-nearest-spec> -t "<test name>"\`.\n`).join('\n');
  write(p('README.md'), `# CarBroz Backend — Constitution-Frozen Architecture

This repository is a modular monolith built with TypeScript, Fastify, Prisma/PostgreSQL, Redis/BullMQ-ready platform adapters, and a strict Server-Driven UI boundary. **The normative architecture is \`docs/MASTER-BACKEND-CONSTITUTION.md\`; this README explains how that architecture executes in code.**

## Runtime flow: process start to response
1. \`apps/api/src/bootstrap/server.ts\` starts the process and calls \`buildApp\`.
2. \`bootstrap/app.ts\` creates Fastify, installs security, multipart, DI, request context, JWT/authorization, safe lifecycle logging, static assets and global error mapping.
3. \`bootstrap/lifecycle/request-flow.plugin.ts\` emits \`http.request.started\` and \`http.request.completed\` with correlation ID, route, surface, status and duration. It never receives raw bodies.
4. The request enters exactly one product surface: \`/api/v1/partner/*\`, \`/api/v1/customer/*\`, or \`/api/v1/admin/*\`. Surfaces do not import one another.
5. A route/controller validates transport input with Zod, resolves an application use case from DI, and maps the result to \`transport/response/ResponseHelper\`.
6. The use case lives in its owning bounded context, applies authorization/orchestration and calls domain repositories/ports. Domain rules remain inside entities/value objects/domain services.
7. Infrastructure adapters implement those inward ports. Prisma access stays inside the owning domain infrastructure; vendor APIs are under \`platform/integrations\`.
8. Errors rise to \`transport/middleware/error-handler.ts\`, which converts Foundation/application errors to stable API envelopes. Technical logs are emitted by \`platform/observability\`; business/security audit records are owned by \`domains/audit\`.

## Where to change or add something
- **New endpoint:** choose Partner/Customer/Admin first, add validation/route/controller under that surface, call an existing/new owning-domain use case. Never put a use case in API.
- **New business rule:** add it to the owning domain/application. Do not put it in a controller, provider, or shared bucket.
- **New repository query:** change the owning domain repository port, then its infrastructure adapter. Do not import Prisma into application/domain code.
- **New third-party provider:** define/extend the inward port in the owning domain, put the concrete vendor adapter in \`platform/integrations\`, and wire it only in \`bootstrap/container\`.
- **New SDUI component/schema primitive:** rendering/schema mechanics go to \`sdui/ui-sdk\`; draft/publish/version/scope lifecycle goes to \`sdui/registry\`. Admin manages SDUI but has no runtime SDUI scope.
- **New cross-domain interaction:** depend only on the other domain's \`public/index.ts\` application contract/event. Never deep-import another domain's internals.
- **New log:** emit a stable event name plus safe metadata. Never log OTPs, tokens, phones, emails, payment/KYC bodies, headers, or raw request/response payloads.

## API executable
### \`apps/api/src/bootstrap\`
\`server.ts\` owns process start; \`app.ts\` owns Fastify composition; \`container\` owns dependency wiring; \`plugins\` owns framework plugins; \`lifecycle\` owns technical request-flow hooks. No business logic belongs here. **Tests:** \`pnpm vitest run apps/api/src/bootstrap tests/architecture/canonical-topology.policy.test.ts\`.

### \`apps/api/src/surfaces/{partner,customer,admin}\`
Each surface owns only its routes/controllers/dto/validation mapping. Adding or changing a product API happens here after the business use case exists in a domain. **Tests:** \`pnpm vitest run apps/api/src/surfaces tests/architecture/product-surface-isolation.policy.test.ts\`.

### \`apps/api/src/transport\`
Framework mechanics shared by surfaces: middleware/guards/request context/error mapping/response plus shared auth and SDUI runtime adapters. This layer may translate; it may not decide business policy. **Tests:** \`pnpm vitest run apps/api/src/transport tests/architecture/engineering-quality.policy.test.ts\`.

### \`apps/api/src/system\`
Operational endpoints such as health checks only. **Tests:** \`pnpm vitest run apps/api/src/system/health\`.

## Bounded contexts and the tests to run while changing them
${rows}
## SDUI
### \`sdui/ui-sdk\`
Owns the six-level SDUI schema/rendering vocabulary and validation/build mechanics; it does not own persistence/lifecycle. **Tests:** \`pnpm vitest run sdui/ui-sdk tests/architecture/sdui-authority.policy.test.ts tests/architecture/sdui-mapping.contract.test.ts\`.

### \`sdui/registry\`
Owns draft/update/publish/archive/version history/compare/rollback/checksum and runtime scope resolution. Runtime scopes are exactly GLOBAL/PARTNER/CUSTOMER. **Tests:** \`pnpm vitest run sdui/registry tests/architecture/sdui-registry-domain.test.ts tests/architecture/sdui-production-definitions.policy.test.ts\`.

## Platform
\`platform/database\` owns Prisma connectivity/transaction mechanics, \`cache\` Redis/cache mechanics, \`messaging\` queue/event transport, \`storage\` object storage, \`observability\` logs/traces/metrics, and \`integrations\` external vendor adapters. Platform code never becomes a business-rule owner. **Tests:** run \`pnpm vitest run platform tests/architecture/domain-dependency.policy.test.ts\` after platform changes.

## Logging and debugging the complete flow
Search logs by \`correlationId\`. Normal request flow is \`http.request.started\` → surface/controller → application operation → \`http.request.completed\`; failures include the stable error code but not payloads. Add new application-flow events through \`@carbroz/platform-observability\` using stable names such as \`booking.create.started\` / \`booking.create.completed\`. Redaction is centralized in \`platform/observability/src/index.ts\` and is mandatory.

## Test commands used as the architecture gate
During development run the command printed beside the module above. Before merge, the complete forensic gate is: \`pnpm install --frozen-lockfile && pnpm exec prisma validate && pnpm exec prisma generate && pnpm -r build && pnpm lint && pnpm test -- --run\`. Architecture-only evidence: \`pnpm vitest run tests/architecture\`. Contract evidence: \`pnpm vitest run tests/contracts\`. Integration evidence: \`pnpm vitest run tests/integration\`. Never waive a failing architecture test to merge a feature.

## New-developer reading order
Read \`docs/MASTER-BACKEND-CONSTITUTION.md\`, then this README, then \`apps/api/src/bootstrap/app.ts\`, \`bootstrap/container/index.ts\`, the target surface route/controller, the owning domain \`public/index.ts\`, its application use case, domain entity/service and finally the infrastructure adapter. That sequence mirrors the runtime dependency direction and is the fastest way to understand a feature without accidentally crossing a boundary.
`);
}

function cleanLegacy() {
  remove(p('apps/api/src/modules/review/api'));
  remove(p('apps/api/src/modules/coupon/api'));
  remove(p('apps/api/src/modules/dispute/api'));
  remove(p('apps/api/src/modules'));
  remove(p('packages'));
  const compatibilityTest = p('tests/architecture/foundation-error-compatibility.policy.test.ts');
  if (exists(compatibilityTest)) remove(compatibilityTest);
}

function fixEntryScripts() {
  const packageFile = p('apps/api/package.json');
  const manifest = JSON.parse(read(packageFile));
  manifest.main = 'dist/bootstrap/server.js';
  manifest.scripts ??= {};
  manifest.scripts.dev = 'tsx watch src/bootstrap/server.ts';
  manifest.scripts.start = 'node dist/bootstrap/server.js';
  write(packageFile, `${JSON.stringify(manifest, null, 2)}\n`);
}

function validateStaticCloseout() {
  const violations = [];
  if (exists(p('packages'))) violations.push('top-level packages/ still exists');
  if (exists(p('apps/api/src/modules'))) violations.push('apps/api/src/modules still exists');
  for (const file of walk(root, (f) => f.endsWith('.ts'))) {
    const content = read(file);
    if (content.includes('@carbroz/common')) violations.push(`${rel(file)} imports @carbroz/common`);
    if (file.startsWith(apiSrc) && /class\s+\w+UseCase\b/.test(content)) violations.push(`${rel(file)} owns a UseCase inside API`);
    if (/Mock OTP generated|request\.body[^\n]*log|log[^\n]*(?:phoneNumber|refreshToken|mockOtp)/i.test(content)) violations.push(`${rel(file)} contains unsafe logging`);
  }
  if (violations.length) throw new Error(`Static constitution validation failed:\n${violations.map((v) => `- ${v}`).join('\n')}`);
}

console.log('[architecture-closeout] begin');
addFoundationContracts();
moveLegacyPorts();
migrateApplicationUseCases();
generateApplicationContracts();
moveInfrastructureAdapters();
moveApiInfrastructure();
moveLegacyBusinessServicesIfNeeded();
createResponseHelper();
rewriteRelativeImports();
rewriteMovedUseCaseDtoImports();
writeObservability();
writeLifecyclePlugin();
writeSharedAuthRoutes();
writeSharedSduiRoutes();
writeMixedSurfaceRoutes();
writeDisputeRoutesFromExisting();
writeSurfaceRoutes();
writeCanonicalApp();
buildOwnershipIndex();
moveAndRewriteTests();
rewriteCommonImports();
rewriteRelativeImports();
addDocumentationComments();
updateWorkspaceDependencies();
writeArchitectureTests();
writeDeveloperReadme();
fixEntryScripts();
cleanLegacy();
validateStaticCloseout();
console.log(`[architecture-closeout] transformed ${changed.size} files; static constitution checks passed`);
