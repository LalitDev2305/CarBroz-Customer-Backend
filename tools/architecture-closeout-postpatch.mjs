import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const api = path.join(root, 'apps/api/src');
const p = (...parts) => path.join(root, ...parts);
const exists = (file) => fs.existsSync(file);
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  ensureDir(path.dirname(file));
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
const relativeImport = (fromFile, toFile) => {
  let specifier = path.relative(path.dirname(fromFile), toFile).replaceAll('\\', '/').replace(/\.ts$/, '.js');
  if (!specifier.startsWith('.')) specifier = `./${specifier}`;
  return specifier;
};
const resolveTsModule = (fromFile, specifier) => {
  if (!specifier.startsWith('.')) return undefined;
  const raw = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    raw,
    raw.replace(/\.js$/, '.ts'),
    raw.replace(/\.mjs$/, '.mts'),
    `${raw}.ts`,
    path.join(raw, 'index.ts'),
  ];
  return candidates.find((candidate) => exists(candidate));
};
const copyTransportContract = (fromSurface, sourceName, targetName = sourceName) => {
  const source = p('apps/api/src/surfaces', fromSurface, 'dto', sourceName);
  const target = p('apps/api/src/surfaces/admin/dto', targetName);
  if (!exists(source)) return;
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
};

for (const name of ['review.dto.ts', 'coupon.dto.ts', 'dispute.dto.ts']) copyTransportContract('customer', name);
copyTransportContract('customer', 'catalog.catalog.dto.ts', 'admin-catalog.dto.ts');
copyTransportContract('partner', 'partner.partner.dto.ts', 'admin-partner.dto.ts');

const adminRewrites = new Map([
  ['apps/api/src/surfaces/admin/routes/review.routes.ts', ["../../customer/dto/review.dto.js", "../dto/review.dto.js"]],
  ['apps/api/src/surfaces/admin/routes/coupon.routes.ts', ["../../customer/dto/coupon.dto.js", "../dto/coupon.dto.js"]],
  ['apps/api/src/surfaces/admin/routes/dispute.routes.ts', ["../../customer/dto/dispute.dto.js", "../dto/dispute.dto.js"]],
  ['apps/api/src/surfaces/admin/controllers/admin-catalog.controller.ts', ["../../customer/dto/catalog.catalog.dto.js", "../dto/admin-catalog.dto.js"]],
  ['apps/api/src/surfaces/admin/controllers/admin-partner.controller.ts', ["../../partner/dto/partner.partner.dto.js", "../dto/admin-partner.dto.js"]],
]);
for (const [fileRel, [from, to]] of adminRewrites) {
  const file = p(fileRel);
  if (exists(file)) write(file, read(file).replaceAll(from, to));
}

// IProvider was an empty marker interface; Money is a real universal value object owned by Foundation.
for (const base of ['apps', 'domains', 'sdui', 'platform', 'foundation']) {
  for (const file of walk(p(base)).filter((candidate) => candidate.endsWith('.ts'))) {
    let content = read(file);
    content = content.replace(
      /^import\s+(?:type\s+)?\{\s*IProvider\s*\}\s+from\s+['"][^'"]*packages\/common\/src\/providers\/IProvider(?:\.js)?['"];?\s*$/gm,
      '',
    );
    content = content
      .replace(/\s+extends\s+IProvider\s*,\s*/g, ' extends ')
      .replace(/,\s*IProvider(?=\s*\{)/g, '')
      .replace(/\s+extends\s+IProvider(?=\s*\{)/g, '')
      .replace(/(['"])(?:\.\.\/)+packages\/common\/src\/domain\/value-objects\/Money\.js\1/g, "'@carbroz/foundation-kernel'");
    write(file, content);
  }
}

// Common contained compatibility wrappers that merely re-exported Configuration's real provider
// contracts. The migration must not turn those wrappers into new ports inside the owning package.
for (const duplicate of [
  'domains/configuration/application/ports/IConfigProvider.ts',
  'domains/configuration/application/ports/IFeatureFlagProvider.ts',
]) {
  fs.rmSync(p(duplicate), { force: true });
}
const configurationPublic = p('domains/configuration/public/index.ts');
if (exists(configurationPublic)) {
  let content = read(configurationPublic)
    .replace(/^export \* from '\.\.\/application\/ports\/IConfigProvider\.js';\s*$/gm, '')
    .replace(/^export \* from '\.\.\/application\/ports\/IFeatureFlagProvider\.js';\s*$/gm, '');
  write(configurationPublic, content.replace(/\n{3,}/g, '\n\n'));
}

const loggerAdapter = p('platform/observability/src/adapters/LoggerProvider.ts');
if (exists(loggerAdapter)) {
  let content = read(loggerAdapter);
  content = content
    .replace("import { ILoggerProvider } from '@carbroz/platform-observability';", "import { ILoggerProvider } from '../ports/ILoggerProvider.js';")
    .replace("import { logger } from '@carbroz/platform-observability';", "import { logger } from '../index.js';");
  write(loggerAdapter, content);
}

// Build a symbol-to-declaration map from each package's public entry point. Internal source must use
// local declaration imports rather than routing back through its own published package boundary.
const collectExports = (entryFile, symbolMap, visited = new Set()) => {
  const resolvedEntry = path.resolve(entryFile);
  if (visited.has(resolvedEntry) || !exists(resolvedEntry)) return;
  visited.add(resolvedEntry);
  const source = ts.createSourceFile(resolvedEntry, read(resolvedEntry), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  for (const statement of source.statements) {
    const modifiers = statement.modifiers ?? [];
    const isExported = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (isExported) {
      if ((ts.isInterfaceDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement) || ts.isFunctionDeclaration(statement)) && statement.name) {
        symbolMap.set(statement.name.text, resolvedEntry);
      }
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) symbolMap.set(declaration.name.text, resolvedEntry);
        }
      }
    }

    if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const target = resolveTsModule(resolvedEntry, statement.moduleSpecifier.text);
    if (!target) continue;
    if (!statement.exportClause) {
      collectExports(target, symbolMap, visited);
      continue;
    }
    if (ts.isNamedExports(statement.exportClause)) {
      const targetExports = new Map();
      collectExports(target, targetExports, new Set());
      for (const element of statement.exportClause.elements) {
        const exportedName = element.name.text;
        const sourceName = element.propertyName?.text ?? exportedName;
        symbolMap.set(exportedName, targetExports.get(sourceName) ?? target);
      }
    }
  }
};

const selfImportResolutionErrors = [];
for (const base of ['apps', 'domains', 'sdui', 'platform', 'foundation']) {
  const baseDir = p(base);
  if (!exists(baseDir)) continue;
  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packageRoot = path.join(baseDir, entry.name);
    const manifestFile = path.join(packageRoot, 'package.json');
    if (!exists(manifestFile)) continue;
    const manifest = JSON.parse(read(manifestFile));
    const packageName = manifest.name;
    if (!packageName) continue;
    const publicEntry = [path.join(packageRoot, 'public/index.ts'), path.join(packageRoot, 'src/index.ts')].find(exists);
    if (!publicEntry) continue;
    const symbolMap = new Map();
    collectExports(publicEntry, symbolMap);

    for (const file of walk(packageRoot).filter((candidate) => candidate.endsWith('.ts'))) {
      let content = read(file);
      const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      const replacements = [];
      for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
        const specifier = statement.moduleSpecifier.text;
        if (specifier !== packageName && !specifier.startsWith(`${packageName}/`)) continue;
        const clause = statement.importClause;
        if (!clause || clause.name || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings) || specifier !== packageName) {
          selfImportResolutionErrors.push(`${path.relative(root, file)} has unsupported self-import form: ${statement.getText(source)}`);
          continue;
        }
        const groups = new Map();
        for (const element of clause.namedBindings.elements) {
          const exportedName = element.propertyName?.text ?? element.name.text;
          const target = symbolMap.get(exportedName);
          if (!target) {
            selfImportResolutionErrors.push(`${path.relative(root, file)} cannot resolve self-imported symbol ${exportedName} from ${packageName}`);
            continue;
          }
          const parts = groups.get(target) ?? [];
          const alias = element.propertyName ? `${element.propertyName.text} as ${element.name.text}` : element.name.text;
          parts.push(element.isTypeOnly && !clause.isTypeOnly ? `type ${alias}` : alias);
          groups.set(target, parts);
        }
        if (groups.size) {
          const rendered = [...groups.entries()].map(([target, names]) => {
            const typePrefix = clause.isTypeOnly ? ' type' : '';
            return `import${typePrefix} { ${names.join(', ')} } from '${relativeImport(file, target)}';`;
          }).join('\n');
          replacements.push({ start: statement.getFullStart(), end: statement.getEnd(), text: rendered });
        }
      }
      for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
        content = content.slice(0, replacement.start) + replacement.text + content.slice(replacement.end);
      }
      if (replacements.length) write(file, content);
    }
  }
}

write(
  p('pnpm-workspace.yaml'),
  `packages:\n  - "apps/*"\n  - "domains/*"\n  - "sdui/*"\n  - "platform/*"\n  - "foundation/*"\nallowBuilds:\n  '@prisma/client': true\n  '@prisma/engines': true\n  bcrypt: true\n  esbuild: true\n  msgpackr-extract: true\n  prisma: true\n`,
);

const rootPackageFile = p('package.json');
if (exists(rootPackageFile)) {
  const rootPackage = JSON.parse(read(rootPackageFile));
  if (rootPackage.pnpm) delete rootPackage.pnpm;
  write(rootPackageFile, `${JSON.stringify(rootPackage, null, 2)}\n`);
}
write(p('.env'), 'DATABASE_URL=postgresql://carbroz_validation:carbroz_validation@127.0.0.1:5432/carbroz_validation\n');

for (const name of ['canonical-topology.policy.test.ts', 'engineering-quality.policy.test.ts']) {
  const file = p('tests/architecture', name);
  if (exists(file)) {
    let content = read(file);
    content = content.replace("['node_modules','dist','generated']", "['node_modules','dist','generated','.git']");
    content = content.replace("['node_modules', 'dist', 'generated']", "['node_modules', 'dist', 'generated', '.git']");
    write(file, content);
  }
}

const violations = [...selfImportResolutionErrors];
const surfaces = ['partner', 'customer', 'admin'];
const importPattern = /(?:from\s+|import\s*\(\s*)['\"]([^'\"]+)['\"]/g;

for (const surface of surfaces) {
  const surfaceRoot = p('apps/api/src/surfaces', surface);
  for (const file of walk(surfaceRoot).filter((candidate) => candidate.endsWith('.ts'))) {
    const content = read(file);
    for (const match of content.matchAll(importPattern)) {
      const specifier = match[1];
      for (const other of surfaces.filter((candidate) => candidate !== surface)) {
        let importsOtherSurface = false;
        if (specifier.startsWith('.')) {
          const resolved = path.resolve(path.dirname(file), specifier.replace(/\.js$/, '.ts'));
          const otherRoot = path.resolve(p('apps/api/src/surfaces', other));
          importsOtherSurface = resolved === otherRoot || resolved.startsWith(`${otherRoot}${path.sep}`);
        } else {
          importsOtherSurface = new RegExp(`^@carbroz/api(?:/|$).*surfaces/${other}(?:/|$)`).test(specifier);
        }
        if (importsOtherSurface) violations.push(`${path.relative(root, file)} imports ${other} surface via ${specifier}`);
      }
    }
  }
}

for (const base of ['apps', 'domains', 'sdui', 'platform', 'foundation']) {
  for (const file of walk(p(base)).filter((candidate) => candidate.endsWith('.ts'))) {
    const content = read(file);
    for (const match of content.matchAll(importPattern)) {
      const specifier = match[1];
      if (specifier === '@carbroz/common' || specifier.includes('packages/common')) violations.push(`${path.relative(root, file)} retains legacy Common import ${specifier}`);
    }
  }
}

for (const base of ['apps', 'domains', 'sdui', 'platform', 'foundation']) {
  const baseDir = p(base);
  if (!exists(baseDir)) continue;
  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packageRoot = path.join(baseDir, entry.name);
    const manifestFile = path.join(packageRoot, 'package.json');
    if (!exists(manifestFile)) continue;
    const packageName = JSON.parse(read(manifestFile)).name;
    if (!packageName) continue;
    for (const file of walk(packageRoot).filter((candidate) => candidate.endsWith('.ts'))) {
      const content = read(file);
      for (const match of content.matchAll(importPattern)) {
        const specifier = match[1];
        if (specifier === packageName || specifier.startsWith(`${packageName}/`)) violations.push(`${path.relative(root, file)} self-imports ${specifier}`);
      }
    }
  }
}

for (const base of ['domains', 'sdui', 'platform', 'foundation']) {
  for (const file of walk(p(base)).filter((candidate) => /\.(?:spec|test)\.ts$/.test(candidate))) {
    const packageRoot = file.split(path.sep).slice(0, file.includes(`${path.sep}domains${path.sep}financials${path.sep}`) ? 3 : 2).join(path.sep);
    const tsconfig = path.join(packageRoot, 'tsconfig.json');
    if (exists(tsconfig)) {
      const config = read(tsconfig);
      if (!/exclude[\s\S]*(?:spec|test)/i.test(config) && read(file).includes("from 'vitest'")) violations.push(`${path.relative(root, file)} is a Vitest source inside a production package without an explicit test exclusion`);
    }
  }
}

for (const file of walk(api).filter((candidate) => candidate.endsWith('.ts'))) {
  const content = read(file);
  if (/log\.(?:trace|debug|info|warn|error)\([^\n]*(?:mockOtp|otp|phoneNumber|refreshToken|accessToken|request\.body|response\.body|authorization)/i.test(content)) violations.push(`${path.relative(root, file)} contains sensitive/raw logging`);
}

if (violations.length) throw new Error(`Post-closeout invariants failed:\n${violations.map((v) => `- ${v}`).join('\n')}`);
console.log('[architecture-closeout-postpatch] internal self-imports resolved to local declarations; all post-closeout invariants passed');
