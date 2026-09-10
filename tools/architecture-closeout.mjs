import fs from 'node:fs';
import path from 'node:path';

/**
 * CW2 permanent physical-structure verifier.
 *
 * This command is intentionally read-only. CW2 materialization has already happened; this verifier
 * rejects topology drift instead of rewriting source, regenerating documentation, or deleting tools.
 */
const root = process.cwd();
const canonicalWorkspaces = [
  'apps/api',
  'domains/identity', 'domains/partner', 'domains/customer', 'domains/catalog-pricing',
  'domains/booking', 'domains/operations', 'domains/financials', 'domains/communications',
  'domains/engagement', 'domains/configuration', 'domains/dispute', 'domains/enterprise', 'domains/audit',
  'sdui/engine', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage',
  'platform/observability', 'platform/integrations',
  'foundation/kernel',
];
const canonicalWorkspaceRoots = ['apps/*', 'domains/*', 'sdui/*', 'platform/*', 'foundation/*'];
const canonicalApiRoots = ['bootstrap', 'surfaces', 'system', 'transport'];
const constitutionRegressionCommand = 'node tools/architecture-closeout-constitution-gate.mjs --regression';

const violations = [];
const exists = (relative) => fs.existsSync(path.join(root, relative));
const requirePresent = (relative) => {
  if (!exists(relative)) violations.push(`missing required path: ${relative}`);
};
const requireAbsent = (relative) => {
  if (exists(relative)) violations.push(`forbidden transitional path remains: ${relative}`);
};
function packageDirectories(base) {
  const absolute = path.join(root, base);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(absolute, entry.name, 'package.json')))
    .map((entry) => `${base}/${entry.name}`)
    .sort();
}

for (const workspace of canonicalWorkspaces) {
  requirePresent(`${workspace}/package.json`);
  requirePresent(`${workspace}/README.md`);
}

const actualWorkspaces = [
  ...packageDirectories('apps'), ...packageDirectories('domains'), ...packageDirectories('sdui'),
  ...packageDirectories('platform'), ...packageDirectories('foundation'),
].sort();
if (JSON.stringify(actualWorkspaces) !== JSON.stringify([...canonicalWorkspaces].sort())) {
  violations.push(`production workspaces must be exactly ${[...canonicalWorkspaces].sort().join(', ')}`);
}

for (const forbidden of ['packages', 'shared', 'libs', 'common', 'sdui/ui-sdk']) requireAbsent(forbidden);

const workspaceFile = path.join(root, 'pnpm-workspace.yaml');
requirePresent('pnpm-workspace.yaml');
if (fs.existsSync(workspaceFile)) {
  const workspaceSource = fs.readFileSync(workspaceFile, 'utf8');
  const declaredRoots = [...workspaceSource.matchAll(/^\s*-\s*["']?([^"'\s]+)["']?\s*$/gm)].map((match) => match[1]);
  if (JSON.stringify(declaredRoots) !== JSON.stringify(canonicalWorkspaceRoots)) {
    violations.push(`pnpm-workspace.yaml roots must be exactly ${canonicalWorkspaceRoots.join(', ')}`);
  }
}

const apiSrc = path.join(root, 'apps/api/src');
requirePresent('apps/api/src');
if (fs.existsSync(apiSrc)) {
  const actualApiRoots = fs.readdirSync(apiSrc, { withFileTypes: true })
    .map((entry) => entry.name)
    .sort();
  if (JSON.stringify(actualApiRoots) !== JSON.stringify([...canonicalApiRoots].sort())) {
    violations.push(`apps/api/src entries must be exactly ${canonicalApiRoots.join(', ')}`);
  }
}
for (const required of [
  'apps/api/src/bootstrap',
  'apps/api/src/surfaces/partner',
  'apps/api/src/surfaces/customer',
  'apps/api/src/surfaces/admin',
  'apps/api/src/transport',
  'apps/api/src/system',
  'apps/api/src/bootstrap/app.ts',
  'apps/api/src/bootstrap/server.ts',
]) requirePresent(required);

for (const forbidden of [
  'apps/api/src/modules', 'apps/api/src/providers', 'apps/api/src/container', 'apps/api/src/context',
  'apps/api/src/config', 'apps/api/src/controllers', 'apps/api/src/middlewares', 'apps/api/src/plugins',
  'apps/api/src/app.ts', 'apps/api/src/server.ts', 'apps/api/src/app.routes.ts',
]) requireAbsent(forbidden);

const ciFile = path.join(root, '.github/workflows/ci.yml');
requirePresent('.github/workflows/ci.yml');
if (fs.existsSync(ciFile)) {
  const ci = fs.readFileSync(ciFile, 'utf8');
  if (!ci.includes('pnpm install --frozen-lockfile')) violations.push('permanent CI does not enforce frozen lockfile installation');
  if (ci.includes('pnpm install --no-frozen-lockfile')) violations.push('permanent CI still contains mutable lockfile installation');
  if (!ci.includes(constitutionRegressionCommand)) violations.push('permanent CI does not invoke the read-only CW1/CW2 Constitution regression gate');
}

const closeoutWorkflow = path.join(root, '.github/workflows/architecture-closeout.yml');
requirePresent('.github/workflows/architecture-closeout.yml');
if (fs.existsSync(closeoutWorkflow)) {
  const workflow = fs.readFileSync(closeoutWorkflow, 'utf8');
  if (!workflow.includes(constitutionRegressionCommand)) violations.push('architecture closeout workflow does not invoke the read-only CW1/CW2 Constitution regression gate');
}

if (violations.length > 0) {
  console.error('[cw2-verifier] physical architecture verification failed:');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exitCode = 1;
} else {
  console.log(`[cw2-verifier] PASS: ${canonicalWorkspaces.length} exact canonical workspaces, exact API roots, frozen workspace globs, and permanent CW1/CW2 regression enforcement verified`);
}
