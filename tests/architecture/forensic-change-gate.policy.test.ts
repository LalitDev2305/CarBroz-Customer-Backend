import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

describe('forensic two-pass architecture change gate', () => {
  it('keeps the forensic gate subordinate to the Master Constitution', () => {
    const path = resolve(root, 'docs/FORENSIC-CHANGE-GATE.md');
    expect(existsSync(path)).toBe(true);

    const policy = read('docs/FORENSIC-CHANGE-GATE.md');
    expect(policy).toContain('subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md`');
    expect(policy).toContain('does not redefine architecture');
  });

  it('requires implementation verification and repository-wide forensic verification', () => {
    const policy = read('docs/FORENSIC-CHANGE-GATE.md');

    expect(policy).toContain('Pass 1 — implementation verification');
    expect(policy).toContain('Pass 2 — repository-wide forensic verification');
    expect(policy).toContain('No-next-slice law');
    expect(policy).toContain('latest coherent slice passes its applicable CI/build/lint/tests');
  });

  it('requires forensic checks for ownership, duplication, dependencies, providers and blast radius', () => {
    const policy = read('docs/FORENSIC-CHANGE-GATE.md');

    expect(policy).toContain('no duplicate implementation or competing authority');
    expect(policy).toContain('no circular dependency');
    expect(policy).toContain('no provider-specific SDK/model leaked into business/application contracts');
    expect(policy).toContain('change blast radius remains narrow');
    expect(policy).toContain('KEEP`, `MOVE`, `MERGE`, `RENAME` or `DELETE`');
  });

  it('retains the Constitution pre-change gate as the controlling architecture authority', () => {
    const constitution = read('docs/MASTER-BACKEND-CONSTITUTION.md');

    expect(constitution).toContain('Mandatory pre-change gate');
    expect(constitution).toContain('Check existing implementation evidence before creating a duplicate abstraction');
    expect(constitution).toContain('Architecture MUST NOT silently drift');
  });
});
