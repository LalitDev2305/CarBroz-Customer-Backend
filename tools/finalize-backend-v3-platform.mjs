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
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(file)); else out.push(file);
  }
  return out;
}

const packageAliases = new Map([
  ['@carbroz/platform-event-bus', '@carbroz/platform-messaging'],
  ['@carbroz/platform-queue', '@carbroz/platform-messaging'],
  ['@carbroz/platform-notification', '@carbroz/platform-integrations'],
  ['@carbroz/platform-feature-flags', '@carbroz/platform-integrations'],
]);

for (const file of walk(root).filter((x) => x.endsWith('.ts') || x.endsWith('.mts') || x.endsWith('.cts'))) {
  let text = fs.readFileSync(file, 'utf8');
  for (const [from, to] of packageAliases) {
    text = text.replaceAll(`'${from}'`, `'${to}'`).replaceAll(`"${from}"`, `"${to}"`);
  }
  fs.writeFileSync(file, text);
}

function writeWorkspacePackage(dir, name, exports) {
  fs.mkdirSync(p(dir), { recursive: true });
  write(`${dir}/index.ts`, exports.map((item) => `export * from '${item}';`).join('\n') + '\n');
  write(`${dir}/tsconfig.json`, JSON.stringify({
    extends: '../../tsconfig.json',
    compilerOptions: { rootDir: '.', outDir: 'dist', types: ['node'] },
    include: ['**/*.ts'],
    exclude: ['dist', 'node_modules'],
  }, null, 2) + '\n');
  write(`${dir}/package.json`, JSON.stringify({
    name,
    version: '1.0.0',
    type: 'module',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: { build: 'tsc' },
    dependencies: {},
    devDependencies: { '@types/node': '^26.1.0' },
  }, null, 2) + '\n');
}

writeWorkspacePackage('platform/messaging', '@carbroz/platform-messaging', [
  './event-bus/src/index.js',
  './queue/src/index.js',
]);
writeWorkspacePackage('platform/integrations', '@carbroz/platform-integrations', [
  './feature-flags/src/index.js',
  './notification/src/index.js',
]);

const workspaces = [
  'apps/api',
  ...fs.readdirSync(p('domains'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => `domains/${e.name}`),
  'sdui/ui-sdk', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage', 'platform/observability', 'platform/integrations',
  'foundation/kernel',
];
const packageNameToPath = new Map();
for (const ws of workspaces) {
  if (!exists(`${ws}/package.json`)) continue;
  const manifest = JSON.parse(read(`${ws}/package.json`));
  if (manifest.name) packageNameToPath.set(manifest.name, ws);
}

for (const ws of workspaces) {
  if (!exists(`${ws}/package.json`)) continue;
  const manifestPath = `${ws}/package.json`;
  const manifest = JSON.parse(read(manifestPath));
  const dependencies = { ...(manifest.dependencies ?? {}) };
  for (const [from, to] of packageAliases) {
    if (dependencies[from]) delete dependencies[from];
    if (walk(p(ws)).some((file) => /\.(?:ts|mts|cts)$/.test(file) && fs.readFileSync(file, 'utf8').includes(to))) {
      dependencies[to] = 'workspace:*';
    }
  }
  for (const file of walk(p(ws)).filter((x) => /\.(?:ts|mts|cts)$/.test(x))) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/(?:from\s+|import\s*\()['"](@carbroz\/[^'"]+)['"]/g)) {
      const dep = match[1];
      if (dep !== manifest.name && packageNameToPath.has(dep)) dependencies[dep] = 'workspace:*';
    }
  }
  if (ws === 'platform/messaging') dependencies.bullmq = '^5.79.2';
  manifest.dependencies = dependencies;
  write(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

for (const file of walk(root).filter((x) => x.endsWith('package.json'))) {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  let changed = false;
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    if (!manifest[key]) continue;
    for (const [from, to] of packageAliases) {
      if (!(from in manifest[key])) continue;
      delete manifest[key][from];
      if (packageNameToPath.has(to)) manifest[key][to] = 'workspace:*';
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
}

for (const legacy of packageAliases.keys()) {
  for (const file of walk(root).filter((x) => /\.(?:ts|mts|cts|json)$/.test(x))) {
    if (fs.readFileSync(file, 'utf8').includes(legacy)) throw new Error(`Legacy platform package identity remains: ${legacy} in ${path.relative(root, file)}`);
  }
}

console.log('Canonical platform workspaces finalized.');
