import { defineConfig } from 'vitest/config';
import { findExecutableProductionFiles } from './tests/architecture/support/production-coverage-scope.mjs';

const executableProductionFiles = findExecutableProductionFiles(process.cwd());

if (executableProductionFiles.length === 0) {
  throw new Error('Constitution §49 coverage scope resolved zero executable production files');
}

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/generated/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      include: executableProductionFiles,
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      }
    }
  }
});
