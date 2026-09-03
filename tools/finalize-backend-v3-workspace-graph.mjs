import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);

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

const candidates = [
  'apps/api',
  ...fs.readdirSync(p('domains'), { withFileTypes: true }).filter((x) => x.isDirectory()).map((x) => `domains/${x.name}`),
  'sdui/ui-sdk', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage', 'platform/observability', 'platform/integrations',
  'foundation/kernel',
].filter((dir) => fs.existsSync(p(dir, 'package.json')));

const workspaces = candidates.map((dir) => {
  const manifestPath = p(dir, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return { dir, manifestPath, manifest, name: manifest.name };
}).filter((x) => x.name);
const workspaceNames = new Set(workspaces.map((x) => x.name));

// Rebuild internal workspace dependencies from actual source imports. This
// intentionally removes stale pre-migration @carbroz dependencies from legacy
// package manifests rather than carrying them into the canonical graph.
for (const workspace of workspaces) {
  const external = Object.fromEntries(Object.entries(workspace.manifest.dependencies ?? {})
    .filter(([name]) => !name.startsWith('@carbroz/')));
  const internal = {};
  for (const file of walk(p(workspace.dir)).filter((x) => /\.(?:ts|mts|cts)$/.test(x) && !x.includes(`${path.sep}dist${path.sep}`))) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/(?:from\s+|import\s*\(\s*)['"](@carbroz\/[^'"]+)['"]/g)) {
      const dependency = match[1];
      if (dependency !== workspace.name && workspaceNames.has(dependency)) internal[dependency] = 'workspace:*';
    }
  }
  workspace.manifest.dependencies = { ...external, ...internal };
  fs.writeFileSync(workspace.manifestPath, `${JSON.stringify(workspace.manifest, null, 2)}\n`);
}

const graph = new Map(workspaces.map((workspace) => [
  workspace.name,
  Object.keys(workspace.manifest.dependencies ?? {}).filter((dep) => workspaceNames.has(dep)),
]));

const visiting = new Set();
const visited = new Set();
const stack = [];
const cycles = [];
function visit(node) {
  if (visiting.has(node)) {
    const start = stack.indexOf(node);
    cycles.push([...stack.slice(start), node]);
    return;
  }
  if (visited.has(node)) return;
  visiting.add(node);
  stack.push(node);
  for (const next of graph.get(node) ?? []) visit(next);
  stack.pop();
  visiting.delete(node);
  visited.add(node);
}
for (const node of graph.keys()) visit(node);

if (cycles.length) {
  const unique = [...new Set(cycles.map((cycle) => cycle.join(' -> ')))];
  throw new Error(`Canonical workspace dependency cycles detected:\n${unique.join('\n')}`);
}

console.log('Backend V3 workspace graph finalized and verified acyclic.');
