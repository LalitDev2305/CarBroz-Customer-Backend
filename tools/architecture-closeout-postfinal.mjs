import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = (relative, content) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
};

write('tests/contracts/canonical-public-contracts.contract.test.ts', `import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const publicEntries = [
  'domains/identity/public/index.ts',
  'domains/partner/public/index.ts',
  'domains/customer/public/index.ts',
  'domains/catalog-pricing/public/index.ts',
  'domains/booking/public/index.ts',
  'domains/operations/public/index.ts',
  'domains/financials/public/index.ts',
  'domains/communications/public/index.ts',
  'domains/engagement/public/index.ts',
  'domains/configuration/public/index.ts',
  'domains/dispute/public/index.ts',
  'domains/enterprise/public/index.ts',
  'domains/audit/public/index.ts',
  'sdui/registry/public/index.ts',
] as const;

describe('canonical public contracts', () => {
  it('publishes deliberate bounded-context entry points without concrete infrastructure', () => {
    for (const entry of publicEntries) {
      const file = path.join(root, entry);
      expect(fs.existsSync(file)).toBe(true);
      const source = fs.readFileSync(file, 'utf8');
      expect(source).not.toContain('/infrastructure/');
      expect(source).not.toContain('@prisma/client');
    }
  });

  it('keeps universal Money and strict ExecutionContext authority in Foundation', () => {
    const money = fs.readFileSync(path.join(root, 'foundation/kernel/src/domain/Money.ts'), 'utf8');
    const contracts = fs.readFileSync(path.join(root, 'foundation/kernel/src/application/contracts.ts'), 'utf8');
    expect(money).toContain('class Money');
    expect(money).toContain('amountMinor');
    expect(contracts).toContain('interface ExecutionContext');
    expect(contracts).toContain('actor: ActorContext');
    expect(contracts).toContain('id: number');
    expect(contracts).not.toContain('actor?:');
  });
});
`);

// The finalizer has already completed its one-time transformation work by this stage.
// Remove temporary tooling before final quality gates so lint/coverage inspect the candidate repository,
// not migration implementation details that are intentionally absent from the frozen tree.
fs.rmSync(path.join(root, 'tools/architecture-closeout-finalize.mjs'), { force: true });
fs.rmSync(new URL(import.meta.url), { force: true });

console.log('[architecture-closeout-postfinal] contract test normalized and executed finalizer tooling removed before quality gates');
