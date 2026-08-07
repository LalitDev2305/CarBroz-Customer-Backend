import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Enterprise Architecture Compliance & Governance Guardrails', () => {
  function walkTsFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.turbo') return;
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        results = results.concat(walkTsFiles(fullPath));
      } else if (file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.endsWith('.spec.ts') && !file.endsWith('.test.ts')) {
        results.push(fullPath);
      }
    });
    return results;
  }

  it('RULE-CLEAN-001 & 002: Enforces zero concrete Prisma & Fastify imports in domain and application layers', () => {
    const domainFiles = walkTsFiles(path.join(process.cwd(), 'domains'));
    domainFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (file.includes('/src/domain/') || file.includes('/src/application/')) {
        const hasPrismaImport = content.includes('@prisma/client') || content.includes('PrismaClient');
        expect(hasPrismaImport, `File ${file} violates Clean Architecture by importing Prisma directly`).toBe(false);

        if (file.includes('/src/domain/')) {
          const hasFastifyImport = content.includes('fastify') || content.includes('FastifyRequest');
          expect(hasFastifyImport, `File ${file} violates Clean Architecture by importing Fastify in domain core`).toBe(false);
        }
      }
    });
  });

  it('RULE-IMPORT-001: Enforces zero cross-package deep /src/ imports', () => {
    const allTsFiles = walkTsFiles(process.cwd());
    allTsFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const hasDeepSrcImport = /from\s+['"](@carbroz\/[^'"]+\/src\/[^'"]+)['"]/.test(content);
      expect(hasDeepSrcImport, `File ${file} contains illegal deep /src/ import bypassing public API`).toBe(false);
    });
  });

  it('RULE-SDUI-001: Enforces single SDUI Engine schema definition & locked package structure', () => {
    const sduiEngineDir = path.join(process.cwd(), 'packages/sdui-engine/src');
    expect(fs.existsSync(sduiEngineDir)).toBe(true);
    expect(fs.existsSync(path.join(sduiEngineDir, 'generator/SduiGenerator.ts'))).toBe(true);
    expect(fs.existsSync(path.join(sduiEngineDir, 'validator/SduiValidator.ts'))).toBe(true);
  });

  it('RULE-DDD-001: Enforces BookingStateMachine existence and domain integration', () => {
    const smPath = path.join(process.cwd(), 'domains/operations/booking/src/domain/BookingStateMachine.ts');
    expect(fs.existsSync(smPath)).toBe(true);
    const content = fs.readFileSync(smPath, 'utf8');
    expect(content.includes('BookingStateMachine')).toBe(true);
    expect(content.includes('validateTransition')).toBe(true);
  });
});
