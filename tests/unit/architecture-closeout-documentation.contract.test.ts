import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync('tools/architecture-closeout-documentation.mjs', 'utf8');

describe('architecture closeout documentation hardener contract', () => {
  it('guards optional TypeScript initializers before node-kind predicates', () => {
    expect(source).toContain('const isFunctionLikeInitializer = (initializer) => Boolean(initializer &&');
    expect(source).toContain('isFunctionLikeInitializer(declaration.initializer)');
    expect(source).toContain('isFunctionLikeInitializer(node.initializer)');
  });

  it('generates permanent TSDoc and module-test documentation policies', () => {
    expect(source).toContain('tests/architecture/tsdoc-documentation.policy.test.ts');
    expect(source).toContain('tests/architecture/module-test-documentation.policy.test.ts');
    expect(source).toContain('docs/FINAL-MODULE-TEST-EVIDENCE.json');
  });

  it('requires exact README testing and specific functionality guidance', () => {
    expect(source).toContain('## How to test this module');
    expect(source).toContain('## Specific functionality verification');
    expect(source).toContain('pnpm exec vitest run');
    expect(source).toContain('pnpm test:freeze');
    expect(source).toContain('No direct-name/source test detected');
  });
});
