import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  fileIsExecutable,
  findExecutableProductionFiles,
  findStructuralProductionFiles,
  sourceTextIsExecutable,
} from './support/production-coverage-scope.mjs';

const root = process.cwd();

describe('Constitution §49 executable production coverage scope', () => {
  it('classifies declarations and barrels as structural rather than fake coverage targets', () => {
    expect(sourceTextIsExecutable("export interface Port { run(): void }\nexport type Id = number;\n")).toBe(false);
    expect(sourceTextIsExecutable("export * from './Contract.js';\nexport type { Port } from './Port.js';\n")).toBe(false);
    expect(sourceTextIsExecutable("import type { Port } from './Port.js';\nexport interface Adapter extends Port {}\n")).toBe(false);
    expect(sourceTextIsExecutable("declare module 'fastify' { interface FastifyRequest { traceId: string } }\n")).toBe(false);
  });

  it('keeps every runtime-owning construct in the 100% coverage denominator', () => {
    expect(sourceTextIsExecutable('export const timeoutMs = 5000;')).toBe(true);
    expect(sourceTextIsExecutable('export function execute() { return true; }')).toBe(true);
    expect(sourceTextIsExecutable('export class Service { execute() { return true; } }')).toBe(true);
    expect(sourceTextIsExecutable("import './bootstrap.js';")).toBe(true);
    expect(sourceTextIsExecutable('export enum State { READY = \'READY\' }')).toBe(true);
    expect(sourceTextIsExecutable('export default {};')).toBe(true);
  });

  it('proves every omitted production TypeScript file is structurally non-executable by AST', () => {
    const executable = new Set(findExecutableProductionFiles(root));
    const structural = findStructuralProductionFiles(root);

    expect(executable.size).toBeGreaterThan(0);
    expect(structural.length).toBeGreaterThan(0);

    for (const relative of structural) {
      expect(executable.has(relative), relative).toBe(false);
      expect(fileIsExecutable(path.join(root, relative)), relative).toBe(false);
      expect(fs.existsSync(path.join(root, relative)), relative).toBe(true);
    }
  });
});
