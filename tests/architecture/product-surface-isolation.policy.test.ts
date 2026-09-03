import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function sourceFiles(directory: string): string[] {
  const absolute = resolve(root, directory);
  if (!existsSync(absolute)) return [];

  const files: string[] = [];
  const visit = (path: string) => {
    for (const entry of readdirSync(path)) {
      if (entry === 'dist' || entry === 'node_modules' || entry === 'coverage') continue;
      const next = join(path, entry);
      const stat = statSync(next);
      if (stat.isDirectory()) visit(next);
      else if (['.ts', '.tsx', '.js', '.mjs', '.cjs'].includes(extname(next))) files.push(next);
    }
  };

  visit(absolute);
  return files;
}

function importsIn(directory: string): Array<{ path: string; source: string }> {
  return sourceFiles(directory).map((path) => ({
    path: relative(root, path).replaceAll('\\', '/'),
    source: readFileSync(path, 'utf8'),
  }));
}

describe('Partner / Customer / Admin product isolation', () => {
  it('prevents Partner API surface from importing Customer surface internals', () => {
    for (const file of importsIn('apps/api/src/surfaces/partner')) {
      expect(file.source, file.path).not.toMatch(/surfaces[\\/]customer|modules[\\/]customer/);
    }
  });

  it('prevents Customer API surface from importing Partner surface internals', () => {
    for (const file of importsIn('apps/api/src/surfaces/customer')) {
      expect(file.source, file.path).not.toMatch(/surfaces[\\/]partner|modules[\\/]partner/);
    }
  });

  it('prevents Admin API surface from importing Partner or Customer transport internals', () => {
    for (const file of importsIn('apps/api/src/surfaces/admin')) {
      expect(file.source, file.path).not.toMatch(/surfaces[\\/](partner|customer)|modules[\\/](partner|customer)[\\/]api/);
    }
  });

  it('prevents Partner domain from importing Customer internals', () => {
    for (const file of importsIn('domains/partner')) {
      expect(file.source, file.path).not.toMatch(/@carbroz\/domain-customer\/(?!public)|domains[\\/]customer[\\/](?!public)/);
    }
  });

  it('prevents Customer domain from importing Partner internals', () => {
    for (const file of importsIn('domains/customer')) {
      expect(file.source, file.path).not.toMatch(/@carbroz\/domain-partner\/(?!public)|domains[\\/]partner[\\/](?!public)/);
    }
  });

  it('keeps generic SDUI independent from Partner and Customer business domains', () => {
    for (const directory of ['sdui/ui-sdk', 'sdui/registry']) {
      for (const file of importsIn(directory)) {
        expect(file.source, file.path).not.toMatch(/@carbroz\/domain-(partner|customer)|domains[\\/](partner|customer)/);
      }
    }
  });

  it('forbids concrete screen-name folders as domain architecture', () => {
    const forbidden = new Set(['splash', 'login', 'otp', 'dashboard']);

    for (const product of ['domains/partner', 'domains/customer']) {
      const absolute = resolve(root, product);
      if (!existsSync(absolute)) continue;

      const visit = (path: string) => {
        for (const entry of readdirSync(path)) {
          const next = join(path, entry);
          if (!statSync(next).isDirectory()) continue;
          if (entry === 'dist' || entry === 'node_modules') continue;
          expect(forbidden.has(entry.toLowerCase()), relative(root, next)).toBe(false);
          visit(next);
        }
      };

      visit(absolute);
    }
  });
});
