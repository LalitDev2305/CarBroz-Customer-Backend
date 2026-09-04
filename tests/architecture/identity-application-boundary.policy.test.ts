import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const applicationRoot = resolve(root, 'domains/identity/application');

function sourceFiles(path: string): string[] {
  return readdirSync(path).flatMap((entry) => {
    const absolute = resolve(path, entry);
    if (statSync(absolute).isDirectory()) return sourceFiles(absolute);
    return entry.endsWith('.ts') ? [absolute] : [];
  });
}

describe('identity application boundary policy', () => {
  it('keeps Identity application use cases transport-neutral', () => {
    const forbiddenImports = [
      "from 'fastify'",
      'from "fastify"',
      "from 'zod'",
      'from "zod"',
      "from '@carbroz/api'",
      'from "@carbroz/api"',
      "from '@carbroz/common'",
      'from "@carbroz/common"',
    ];

    const violations = sourceFiles(applicationRoot).flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      return forbiddenImports
        .filter((forbidden) => source.includes(forbidden))
        .map((forbidden) => `${path.replace(`${root}/`, '')}: ${forbidden}`);
    });

    expect(
      violations,
      `Identity application leaked transport/transitional dependencies: ${violations.join(', ')}`,
    ).toEqual([]);
  });

  it('does not erase authenticated user or session results to unknown', () => {
    const violations = sourceFiles(applicationRoot).flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      const matches = source.match(/(?:user|session)\s*:\s*unknown\b/g) ?? [];
      return matches.map((match) => `${path.replace(`${root}/`, '')}: ${match}`);
    });

    expect(
      violations,
      `Identity application result typing regressed: ${violations.join(', ')}`,
    ).toEqual([]);
  });
});
