import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('Foundation error ownership migration policy', () => {
  it('keeps universal application errors owned by Foundation', () => {
    const foundationErrors = read('foundation/kernel/src/errors/errors.ts');

    expect(foundationErrors).toContain('export class ApplicationError extends KernelError');
    expect(foundationErrors).toContain('export class ForbiddenError extends ApplicationError');
    expect(foundationErrors).toContain('export class NotFoundError extends ApplicationError');
  });

  it('keeps packages/common as a compatibility re-export instead of a second error hierarchy', () => {
    const commonErrors = read('packages/common/src/exceptions.ts');

    expect(commonErrors).toContain("from '@carbroz/foundation-kernel'");
    expect(commonErrors).toContain('ApplicationError as AppError');
    expect(commonErrors).not.toMatch(/class\s+(AppError|ForbiddenError|NotFoundError|ConflictError)/);
  });

  it('documents that new code must bypass the transitional common facade', () => {
    const commonErrors = read('packages/common/src/exceptions.ts');
    const foundationReadme = read('foundation/kernel/README.md');

    expect(commonErrors).toContain('@deprecated');
    expect(commonErrors).toContain('@carbroz/foundation-kernel');
    expect(foundationReadme).toContain('New code imports directly from `@carbroz/foundation-kernel`');
  });
});
