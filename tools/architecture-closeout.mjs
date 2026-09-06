import fs from 'node:fs';
import path from 'node:path';

/**
 * CW2 permanent verifier.
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
  'sdui/ui-sdk', 'sdui/registry',
  'platform/database', 'platform/cache', 'platform/messaging', 'platform/storage',
  'platform/observability', 'platform/integrations',
  'foundation/kernel',
];

const violations = [];
const exists = (relative) => fs.existsSync(path.join(root, relative));
const requirePresent = (relative) => {
  if (!exists(relative)) violations.push(`missing required path: ${relative}`);
};
const requireAbsent = (relative) => {
  if (exists(relative)) violations.push(`forbidden transitional path remains: ${relative}`);
};

for (const workspace of canonicalWorkspaces) {
  requirePresent(`${workspace}/package.json`);
  requirePresent(`${workspace}/README.md`);
}

for (const forbidden of [
  'packages', 'shared', 'libs',
  'apps/api/src/modules', 'apps/api/src/providers', 'apps/api/src/container', 'apps/api/src/context',
]) requireAbsent(forbidden);

const workspaceFile = path.join(root, 'pnpm-workspace.yaml');
requirePresent('pnpm-workspace.yaml');
if (fs.existsSync(workspaceFile)) {
  const workspaceSource = fs.readFileSync(workspaceFile, 'utf8');
  const requiredGlobs = ['apps/*', 'domains/*', 'sdui/*', 'platform/*', 'foundation/*'];
  for (const workspaceGlob of requiredGlobs) {
    if (!workspaceSource.includes(workspaceGlob)) violations.push(`pnpm-workspace.yaml is missing ${workspaceGlob}`);
  }
  for (const forbiddenGlob of ['packages/*', 'shared/*', 'libs/*']) {
    if (workspaceSource.includes(forbiddenGlob)) violations.push(`pnpm-workspace.yaml retains ${forbiddenGlob}`);
  }
}

const ciFile = path.join(root, '.github/workflows/ci.yml');
requirePresent('.github/workflows/ci.yml');
if (fs.existsSync(ciFile)) {
  const ci = fs.readFileSync(ciFile, 'utf8');
  if (!ci.includes('pnpm install --frozen-lockfile')) violations.push('permanent CI does not enforce frozen lockfile installation');
  if (ci.includes('pnpm install --no-frozen-lockfile')) violations.push('permanent CI still contains mutable lockfile installation');
}

if (violations.length > 0) {
  console.error('[cw2-verifier] physical architecture verification failed:');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exitCode = 1;
} else {
  console.log(`[cw2-verifier] PASS: ${canonicalWorkspaces.length} canonical workspaces documented and transitional topology absent`);
}
