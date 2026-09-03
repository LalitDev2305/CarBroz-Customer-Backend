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
    if (exists(target) && !text.includes(`'${spec}'`) && !text.includes(`"${spec}"`)) {
      text += `\nexport * from '${spec}';`;
    }
  }
  write(foundationPublic, `${text}\n`);
}

const workspaceDirs = [
  'apps/api',
  ...fs.readdirSync(p('domains'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `domains/${entry.name}`),
  'sdui/ui-sdk',
  'sdui/registry',
  'platform/database',
  'platform/cache',
  'platform/messaging',
  'platform/storage',
  'platform/observability',
  'platform/integrations',
  'foundation/kernel',
].filter((dir) => exists(`${dir}/package.json`));

const workspaceByRoot = [];
for (const dir of workspaceDirs) {
  const manifest = JSON.parse(read(`${dir}/package.json`));
  if (!manifest.name) continue;
  workspaceByRoot.push({ dir, name: manifest.name, abs: path.resolve(p(dir)) });
}
workspaceByRoot.sort((a, b) => b.abs.length - a.abs.length);

function workspaceForFile(file) {
  const absolute = path.resolve(file);
  return workspaceByRoot.find(({ abs }) => absolute === abs || absolute.startsWith(`${abs}${path.sep}`));
}

function resolveRelativeTs(file, specifier) {
  const raw = path.resolve(path.dirname(file), specifier);
  const candidates = [
    raw,
    raw.replace(/\.js$/, '.ts'),
    raw.replace(/\.mjs$/, '.mts'),
    `${raw}.ts`,
    path.join(raw, 'index.ts'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
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

  text = text.replace(/(from\s+['"])(\.[^'"]+)(['"])/g, (all, start, specifier, end) => {
    return `${start}${replaceSpecifier(specifier)}${end}`;
  });
  text = text.replace(/(import\s*\(\s*['"])(\.[^'"]+)(['"]\s*\))/g, (all, start, specifier, end) => {
    return `${start}${replaceSpecifier(specifier)}${end}`;
  });
  return text;
}

for (const workspace of workspaceByRoot) {
  for (const file of walk(workspace.abs).filter((x) => /\.(?:ts|mts|cts)$/.test(x) && !x.includes(`${path.sep}dist${path.sep}`))) {
    const before = fs.readFileSync(file, 'utf8');
    const after = rewriteCrossWorkspaceImports(file, before);
    if (after !== before) fs.writeFileSync(file, after);
  }
}

// Recompute workspace dependencies from actual canonical package imports.
const packageNames = new Set(workspaceByRoot.map(({ name }) => name));
for (const workspace of workspaceByRoot) {
  const manifestPath = p(workspace.dir, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const dependencies = { ...(manifest.dependencies ?? {}) };
  for (const file of walk(workspace.abs).filter((x) => /\.(?:ts|mts|cts)$/.test(x) && !x.includes(`${path.sep}dist${path.sep}`))) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/(?:from\s+|import\s*\(\s*)['"](@carbroz\/[^'"]+)['"]/g)) {
      const dependency = match[1];
      if (dependency !== workspace.name && packageNames.has(dependency)) dependencies[dependency] = 'workspace:*';
    }
  }
  manifest.dependencies = dependencies;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

// Guard against direct source coupling between separate workspaces.
for (const workspace of workspaceByRoot) {
  for (const file of walk(workspace.abs).filter((x) => /\.(?:ts|mts|cts)$/.test(x) && !x.includes(`${path.sep}dist${path.sep}`))) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      const target = resolveRelativeTs(file, match[1]);
      if (!target) continue;
      const targetWs = workspaceForFile(target);
      if (targetWs && targetWs.name !== workspace.name) {
        throw new Error(`Cross-workspace source import remains: ${path.relative(root, file)} -> ${match[1]}`);
      }
    }
  }
}

console.log('Canonical cross-workspace import boundaries finalized.');
