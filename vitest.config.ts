import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { findExecutableProductionFiles } from './tests/architecture/support/production-coverage-scope.mjs';

const repositoryRoot = process.cwd();
const executableProductionFiles = findExecutableProductionFiles(repositoryRoot);

if (executableProductionFiles.length === 0) {
  throw new Error('Constitution §49 coverage scope resolved zero executable production files');
}

/**
 * Resolve CarBroz workspace package imports to their canonical TypeScript public entry points while testing.
 *
 * CI intentionally builds before Vitest. Without these aliases Node resolves workspace packages through each
 * package.json `main` field into `dist/**`, so behavioral tests execute compiled copies while Constitution §49
 * instruments the executable TypeScript production tree. That makes genuine behavior invisible to source
 * coverage and can also allow source/dist behavior to diverge. Tests must execute the exact source being
 * certified; build correctness remains independently proven by the preceding `pnpm -r build` gate.
 */
function findWorkspaceSourceAliases(): Record<string, string> {
  const aliases: Record<string, string> = {};
  const workspaceRoots = ['apps', 'domains', 'sdui', 'platform', 'foundation', 'packages'];

  for (const workspaceRoot of workspaceRoots) {
    const rootPath = path.join(repositoryRoot, workspaceRoot);
    if (!fs.existsSync(rootPath)) continue;

    for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const packageRoot = path.join(rootPath, entry.name);
      const packageJsonPath = path.join(packageRoot, 'package.json');
      if (!fs.existsSync(packageJsonPath)) continue;

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { name?: string };
      if (!packageJson.name?.startsWith('@carbroz/')) continue;

      const candidates = [
        path.join(packageRoot, 'public', 'index.ts'),
        path.join(packageRoot, 'src', 'public', 'index.ts'),
        path.join(packageRoot, 'src', 'index.ts'),
        path.join(packageRoot, 'index.ts'),
      ];
      const sourceEntry = candidates.find((candidate) => fs.existsSync(candidate));
      if (sourceEntry) aliases[packageJson.name] = sourceEntry;
    }
  }

  return aliases;
}

export default defineConfig({
  resolve: {
    alias: findWorkspaceSourceAliases(),
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/generated/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      include: executableProductionFiles,
      // Keep the strict coverage report actionable in CI: omit already-perfect files so
      // closeout diagnostics show only production behavior that still needs tests.
      reporter: [['text', { skipFull: true }], 'json', 'html'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      }
    }
  }
});
