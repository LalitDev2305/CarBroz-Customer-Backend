import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const exists = (x) => fs.existsSync(p(x));
const read = (x) => fs.readFileSync(p(x), 'utf8');
const write = (x, content) => {
  fs.mkdirSync(path.dirname(p(x)), { recursive: true });
  fs.writeFileSync(p(x), content);
};

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

const sourceFiles = (dir) => walk(dir).filter((x) => /\.(?:ts|mts|cts)$/.test(x) && !x.includes(`${path.sep}dist${path.sep}`));

// Files classified out of the old common package are part of the Foundation
// public contract when another workspace is allowed to depend on them.
const foundationPublic = 'foundation/kernel/src/public/index.ts';
const foundationExports = [
  '../application/IUseCase.js',
  '../application/IRequestContext.js',
  '../application/IBuilder.js',
  '../application/IFactory.js',
  '../application/ports/IProvider.js',
  '../application/ports/IClockProvider.js',
  '../application/ports/IIdGeneratorProvider.js',
  '../application/ports/ITransactionProvider.js',
  '../application/ports/ILoggerProvider.js',
  '../application/ports/IConfigProvider.js',
  '../domain/IEntity.js',
  '../domain/IAggregateRoot.js',
  '../domain/IDomainEvent.js',
  '../domain/IReadRepository.js',
  '../domain/IWriteRepository.js',
  '../domain/IRepository.js',
];
if (exists(foundationPublic)) {
  let text = read(foundationPublic).trimEnd();
  for (const spec of foundationExports) {
    const target = spec.replace(/^\.\.\//, 'foundation/kernel/src/').replace(/\.js$/, '.ts');
    if (exists(target) && !text.includes(`'${spec}'`) && !text.includes(`"${spec}"`)) text += `\nexport * from '${spec}';`;
  }
  write(foundationPublic, `${text}\n`);
}

const workspaceDirs = [
  'apps/api',
  ...fs.readdirSync(p('domains'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => `domains/${entry.name}`),
  'sdui/ui-sdk', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage', 'platform/observability', 'platform/integrations',
  'foundation/kernel',
].filter((dir) => exists(`${dir}/package.json`));

const workspaceByRoot = [];
for (const dir of workspaceDirs) {
  const manifest = JSON.parse(read(`${dir}/package.json`));
  if (manifest.name) workspaceByRoot.push({ dir, name: manifest.name, abs: path.resolve(p(dir)) });
}
workspaceByRoot.sort((a, b) => b.abs.length - a.abs.length);
const workspaceByName = new Map(workspaceByRoot.map((workspace) => [workspace.name, workspace]));

function workspaceForFile(file) {
  const absolute = path.resolve(file);
  return workspaceByRoot.find(({ abs }) => absolute === abs || absolute.startsWith(`${abs}${path.sep}`));
}

function resolveRelativeTs(file, specifier) {
  const raw = path.resolve(path.dirname(file), specifier);
  const candidates = [raw, raw.replace(/\.js$/, '.ts'), raw.replace(/\.mjs$/, '.mts'), `${raw}.ts`, path.join(raw, 'index.ts')];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function toRelativeJs(fromFile, toFile) {
  let relative = path.relative(path.dirname(fromFile), toFile).replaceAll('\\', '/');
  relative = relative.replace(/\.(?:ts|mts|cts)$/, '.js');
  if (!relative.startsWith('.')) relative = `./${relative}`;
  return relative;
}

// Build a declaration index so package imports can be normalized without
// reaching through another workspace's source tree and self-package imports
// can resolve to local source before dist exists.
const declarationIndex = new Map();
for (const workspace of workspaceByRoot) {
  const symbols = new Map();
  for (const file of sourceFiles(workspace.abs)) {
    const text = fs.readFileSync(file, 'utf8');
    const declarationRx = /export\s+(?:declare\s+)?(?:abstract\s+)?(class|interface|enum|type|const|function)\s+([A-Za-z_$][\w$]*)/g;
    for (const match of text.matchAll(declarationRx)) {
      if (!symbols.has(match[2])) symbols.set(match[2], { file, kind: match[1] });
    }
  }
  declarationIndex.set(workspace.name, symbols);
}

const parseImportToken = (token) => {
  const trimmed = token.trim();
  const explicitlyType = trimmed.startsWith('type ');
  const withoutType = trimmed.replace(/^type\s+/, '').trim();
  const [imported, local] = withoutType.split(/\s+as\s+/).map((part) => part.trim());
  return { imported, local: local ?? imported, explicitlyType };
};

function formatToken(token, forceType) {
  const parsed = parseImportToken(token);
  const core = parsed.local !== parsed.imported ? `${parsed.imported} as ${parsed.local}` : parsed.imported;
  return (parsed.explicitlyType || forceType) ? `type ${core}` : core;
}

function rewriteNamedPackageImports(file, text) {
  const sourceWorkspace = workspaceForFile(file);
  if (!sourceWorkspace) return text;

  return text.replace(/import\s+(type\s+)?\{([^}]*)\}\s+from\s+['"](@carbroz\/[^'"]+)['"];?/g, (all, wholeType, body, packageName) => {
    const targetWorkspace = workspaceByName.get(packageName);
    if (!targetWorkspace) return all;
    const tokens = body.split(',').map((token) => token.trim()).filter(Boolean);
    const symbols = declarationIndex.get(packageName) ?? new Map();

    // A workspace importing its own public package cannot resolve dist while it
    // is building. Resolve every known symbol to its actual local source file.
    if (packageName === sourceWorkspace.name) {
      const grouped = new Map();
      const unresolved = [];
      for (const token of tokens) {
        const parsed = parseImportToken(token);
        const declaration = symbols.get(parsed.imported);
        if (!declaration || path.resolve(declaration.file) === path.resolve(file)) {
          unresolved.push(token);
          continue;
        }
        const specifier = toRelativeJs(file, declaration.file);
        const group = grouped.get(specifier) ?? [];
        group.push(formatToken(token, declaration.kind === 'interface' || declaration.kind === 'type'));
        grouped.set(specifier, group);
      }
      const statements = [...grouped.entries()].map(([specifier, names]) => `import { ${names.join(', ')} } from '${specifier}';`);
      if (unresolved.length) statements.push(`import ${wholeType ?? ''}{ ${unresolved.join(', ')} } from '${packageName}';`);
      return statements.join('\n');
    }

    // With verbatimModuleSyntax enabled, interface/type-only imports must be
    // explicit. Keep runtime imports as runtime values.
    const normalized = tokens.map((token) => {
      const parsed = parseImportToken(token);
      const declaration = symbols.get(parsed.imported);
      return formatToken(token, Boolean(wholeType) || declaration?.kind === 'interface' || declaration?.kind === 'type');
    });
    return `import { ${normalized.join(', ')} } from '${packageName}';`;
  });
}

function rewriteCrossWorkspaceImports(file, text) {
  const sourceWs = workspaceForFile(file);
  if (!sourceWs) return text;
  const replaceSpecifier = (specifier) => {
    if (!specifier.startsWith('.')) return specifier;
    const target = resolveRelativeTs(file, specifier);
    if (!target) return specifier;
    const targetWs = workspaceForFile(target);
    if (!targetWs || targetWs.name === sourceWs.name) return specifier;
    return targetWs.name;
  };
  text = text.replace(/(from\s+['"])(\.[^'"]+)(['"])/g, (all, start, specifier, end) => `${start}${replaceSpecifier(specifier)}${end}`);
  text = text.replace(/(import\s*\(\s*['"])(\.[^'"]+)(['"]\s*\))/g, (all, start, specifier, end) => `${start}${replaceSpecifier(specifier)}${end}`);
  return text;
}

for (const workspace of workspaceByRoot) {
  for (const file of sourceFiles(workspace.abs)) {
    const before = fs.readFileSync(file, 'utf8');
    let after = rewriteCrossWorkspaceImports(file, before);
    after = rewriteNamedPackageImports(file, after);
    if (after !== before) fs.writeFileSync(file, after);
  }
}

// Preserve optional constructor-input semantics while making class storage
// explicit under exactOptionalPropertyTypes.
const auditLogPath = 'domains/audit/domain/AuditLog.ts';
if (exists(auditLogPath)) {
  let text = read(auditLogPath);
  for (const name of ['targetType', 'targetId', 'deviceId', 'ipAddress', 'userAgent', 'applicationPublicId', 'endpoint', 'surface']) {
    text = text.replace(`readonly ${name}?: string;`, `readonly ${name}: string | undefined;`);
  }
  text = text.replace('readonly statusCode?: number;', 'readonly statusCode: number | undefined;');
  write(auditLogPath, text);
}

// Recompute workspace dependencies from actual canonical package imports.
const packageNames = new Set(workspaceByRoot.map(({ name }) => name));
for (const workspace of workspaceByRoot) {
  const manifestPath = p(workspace.dir, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const dependencies = { ...(manifest.dependencies ?? {}) };
  for (const file of sourceFiles(workspace.abs)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/(?:from\s+|import\s*\(\s*)['"](@carbroz\/[^'"]+)['"]/g)) {
      const dependency = match[1];
      if (dependency !== workspace.name && packageNames.has(dependency)) dependencies[dependency] = 'workspace:*';
    }
  }
  manifest.dependencies = dependencies;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

// Guards: no source-level coupling across workspace roots and no resolvable
// self-package imports may remain.
for (const workspace of workspaceByRoot) {
  for (const file of sourceFiles(workspace.abs)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      const target = resolveRelativeTs(file, match[1]);
      if (!target) continue;
      const targetWs = workspaceForFile(target);
      if (targetWs && targetWs.name !== workspace.name) throw new Error(`Cross-workspace source import remains: ${path.relative(root, file)} -> ${match[1]}`);
    }
    if (new RegExp(`from\\s+['\"]${workspace.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]`).test(text)) {
      throw new Error(`Self-package import remains: ${path.relative(root, file)} -> ${workspace.name}`);
    }
  }
}

console.log('Canonical cross-workspace import boundaries finalized.');
