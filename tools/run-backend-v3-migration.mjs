import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = path.resolve('tools/backend-v3-migrate.mjs');
let source = fs.readFileSync(sourcePath, 'utf8');

function replaceOnce(search, replacement, label) {
  if (!source.includes(search)) throw new Error(`Migration runner patch not found: ${label}`);
  source = source.replace(search, replacement);
}

replaceOnce(
  "['domains/partner/', 'domains/catalog-pricing/', 'domains/financials/', 'domains/operations/', 'domains/communications/', 'domains/engagement/', 'domains/configuration/', 'domains/enterprise/', 'apps/api', 'GLOBAL', 'PARTNER', 'CUSTOMER']",
  "['partner/', 'catalog-pricing/', 'financials/', 'operations/', 'communications/', 'engagement/', 'configuration/', 'enterprise/', 'apps/', 'GLOBAL', 'PARTNER', 'CUSTOMER']",
  'constitution markers',
);

replaceOnce(
  "['domains/notification', 'domains/communications/notification'],",
  "['domains/notification', 'domains/communications'],",
  'communications bounded-context consolidation',
);

replaceOnce(
  "[/^domain\\/notification\\/(.*)$/, 'domains/communications/domain/notification/$1'],",
  "[/^domain\\/notification\\/(.*)$/, 'domains/communications/domain/$1'],",
  'communications common-domain ownership',
);

replaceOnce(
  "if (!owner || !newAbs.endsWith('.ts')) continue;",
  "if (!owner || !newAbs.endsWith('.ts') || !fs.existsSync(newAbs)) continue;",
  'moved-source existence check',
);

replaceOnce(
  "/import\\s+(type\\s+)?\\{([\\s\\S]*?)\\}\\s+from\\s+['\"]@carbroz\\/common['\"];?/g",
  "/import\\s+(type\\s+)?\\{([^}]*)\\}\\s+from\\s+['\"]@carbroz\\/common['\"];?/g",
  'bounded common import regex',
);

replaceOnce(
  "['platform/storage/','@carbroz/platform-storage'], ['apps/api/','@carbroz/api'],",
  "['platform/storage/','@carbroz/platform-storage'], ['sdui/registry/','@carbroz/sdui-registry'], ['sdui/ui-sdk/','@carbroz/ui-sdk'], ['apps/api/','@carbroz/api'],",
  'SDUI owner map',
);

replaceOnce(
  "// Common aliases known to be exported without a declaration match.\nsymbolOwner.set('ResponseHelper', '@carbroz/api');",
  `// Index canonical SDUI symbols that were never correctly owned by common.\nfor (const [dir, owner] of [['sdui/registry','@carbroz/sdui-registry'], ['sdui/ui-sdk','@carbroz/ui-sdk']]) {\n  for (const f of walk(p(dir)).filter((x) => x.endsWith('.ts'))) {\n    const t = fs.readFileSync(f, 'utf8');\n    for (const m of t.matchAll(/export\\s+(?:declare\\s+)?(?:abstract\\s+)?(?:class|interface|enum|type|const|function)\\s+([A-Za-z_$][\\w$]*)/g)) symbolOwner.set(m[1], owner);\n  }\n}\n// Common aliases known to be exported without a declaration match.\nsymbolOwner.set('ResponseHelper', '@carbroz/api');`,
  'SDUI symbol indexing',
);

replaceOnce(
  '// Platform consolidation: technology only.',
  `// Business persistence adapters belong to their bounded context, never platform/database.\nconst databaseRepositoryOwners = {\n  PrismaAdminRoleRepository: 'identity', PrismaUserRepository: 'identity', PrismaUserSessionRepository: 'identity', PrismaRoleRepository: 'identity', PrismaPermissionRepository: 'identity',\n  PrismaPartnerRepository: 'partner', PrismaPartnerMemberRepository: 'partner', PrismaPartnerProfileRepository: 'partner',\n  PrismaCatalogRepository: 'catalog-pricing', PrismaPricingRepository: 'catalog-pricing',\n  PrismaPaymentRepository: 'financials', PrismaInvoiceRepository: 'financials', PrismaPartnerPayoutRepository: 'financials',\n  PrismaTrackingSessionRepository: 'operations',\n  PrismaNotificationLogRepository: 'communications', PrismaDeviceTokenRepository: 'communications',\n  PrismaReviewRepository: 'engagement', PrismaCouponRepository: 'engagement', PrismaCouponUsageRepository: 'engagement',\n  PrismaConfigRepository: 'configuration', PrismaFeatureFlagRepository: 'configuration',\n  PrismaDisputeRepository: 'dispute', PrismaAuditLogRepository: 'audit',\n  PrismaCorporateAccountRepository: 'enterprise', PrismaCorporateMemberRepository: 'enterprise', PrismaCorporateFleetVehicleRepository: 'enterprise', PrismaCorporateCreditLedgerRepository: 'enterprise', PrismaCorporateInvoiceRepository: 'enterprise',\n};\nfor (const [className, domain] of Object.entries(databaseRepositoryOwners)) {\n  const from = 'platform/database/src/repositories/' + className + '.ts';\n  const to = 'domains/' + domain + '/infrastructure/repositories/' + className + '.ts';\n  if (exists(from)) moveFile(from, to);\n}\nif (exists('platform/database/src/index.ts')) {\n  write('platform/database/src/index.ts', [\n    \"export * from './providers/PrismaProvider.js';\",\n    \"export * from './providers/PrismaDatabaseProvider.js';\",\n    \"export * from './providers/PrismaTransactionProvider.js';\",\n    \"export * from './repositories/PrismaRepositoryBase.js';\",\n    \"export * from './repositories/RepositoryFactory.js';\",\n    \"export * from './public/index.js';\",\n    '',\n  ].join('\\n'));\n}\n\n// Platform consolidation: technology only.`,
  'business persistence ownership',
);

replaceOnce(
  '// Retire duplicate legacy roots after source classification.',
  `// Technical environment/runtime configuration belongs to API bootstrap, not the business Configuration domain.\nmoveTree('packages/config/src', 'apps/api/src/bootstrap/config');\n\n// Retire duplicate legacy roots after source classification.`,
  'technical config ownership',
);

replaceOnce(
  "rm('packages/config');\nrm('shared');",
  "rm('packages/config');\nrm('packages');\nrm('shared');",
  'retired package root removal',
);

replaceOnce(
  "for (const file of walk(root).filter((x) => x.endsWith('.ts'))) {\n  let text = fs.readFileSync(file, 'utf8');",
  `for (const file of walk(root).filter((x) => x.endsWith('.ts'))) {\n  let text = fs.readFileSync(file, 'utf8');\n  if (text.includes('@carbroz/config')) {\n    if (!rel(file).startsWith('apps/api/')) throw new Error('Technical @carbroz/config consumer outside API bootstrap boundary: ' + rel(file));\n    const configIndex = p('apps/api/src/bootstrap/config/index.ts');\n    const spec = toJsRelative(file, configIndex);\n    text = text.replaceAll(\"'@carbroz/config'\", \"'\" + spec + \"'\").replaceAll('\"@carbroz/config\"', '\"' + spec + '\"');\n  }\n  text = text.replace(/import\\(['\"]@carbroz\\/common['\"]\\)\\.([A-Za-z_$][\\w$]*)/g, (all, symbol) => {\n    const owner = symbolOwner.get(symbol);\n    if (!owner) throw new Error('No canonical owner for @carbroz/common type query ' + symbol + ' in ' + rel(file));\n    return \"import('\" + owner + \"').\" + symbol;\n  });`,
  'technical config and common type-query rewrite',
);

replaceOnce(
  "if (text.includes('@carbroz/common')) text = rewriteCommonImports(file, text);",
  `if (text.includes('@carbroz/common')) text = rewriteCommonImports(file, text);\n  text = text.replace(/import\\s+(type\\s+)?\\{([^}]*)\\}\\s+from\\s+['\"]@carbroz\\/platform-database['\"];?/g, (all, typeOnly, body) => {\n    const groups = new Map();\n    for (const token of body.split(',').map((x) => x.trim()).filter(Boolean)) {\n      const original = token.replace(/^type\\s+/, '').split(/\\s+as\\s+/)[0].trim();\n      const owner = symbolOwner.get(original);\n      const pkg = owner && owner !== '@carbroz/platform-database' ? owner : '@carbroz/platform-database';\n      const arr = groups.get(pkg) ?? [];\n      arr.push(token);\n      groups.set(pkg, arr);\n    }\n    return [...groups.entries()].map(([pkg, names]) => 'import ' + (typeOnly ?? '') + '{ ' + names.join(', ') + \" } from '\" + pkg + \"';\").join('\\n');\n  });`,
  'platform database import split',
);

replaceOnce(
  "return walk(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.includes('/tests/') && !f.includes('/dist/') && !f.includes('/infrastructure/'));",
  "return walk(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.includes('/tests/') && !f.includes('/dist/') && (!f.includes('/infrastructure/') || f.includes('/infrastructure/repositories/')));",
  'composition repository public exports',
);

replaceOnce(
  "for (const f of walk(p('apps/api/src')).filter((x) => x.endsWith('.ts'))) {",
  `if (exists('platform/database/src/repositories')) {\n  for (const f of walk(p('platform/database/src/repositories')).filter((x) => /^Prisma(?!RepositoryBase)/.test(path.basename(x)))) {\n    throw new Error('Business repository remains in platform/database: ' + rel(f));\n  }\n}\nfor (const f of walk(p('apps/api/src')).filter((x) => x.endsWith('.ts'))) {`,
  'platform database ownership guard',
);

replaceOnce(
  "if (text.includes('@carbroz/common')) throw new Error(`Legacy common import remains: ${rel(f)}`);",
  "if (/from\\s+['\"]@carbroz\\/common['\"]/.test(text) || /import\\(['\"]@carbroz\\/common['\"]\\)/.test(text)) throw new Error(`Legacy common import remains: ${rel(f)}`);",
  'legacy common import guard',
);

replaceOnce(
  "if (text.includes('@carbroz/config')) throw new Error(`Legacy config import remains: ${rel(f)}`);",
  "if (/from\\s+['\"]@carbroz\\/config['\"]/.test(text) || /import\\(['\"]@carbroz\\/config['\"]\\)/.test(text)) throw new Error(`Legacy config import remains: ${rel(f)}`);",
  'legacy config import guard',
);

const tempPath = path.join(os.tmpdir(), `carbroz-backend-v3-migrate-${process.pid}.mjs`);
fs.writeFileSync(tempPath, source);
try {
  await import(pathToFileURL(tempPath).href + `?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
