import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const publicEntries = [
  'domains/identity/public/index.ts', 'domains/partner/public/index.ts', 'domains/customer/public/index.ts',
  'domains/catalog-pricing/public/index.ts', 'domains/booking/public/index.ts', 'domains/operations/public/index.ts',
  'domains/financials/public/index.ts', 'domains/communications/public/index.ts', 'domains/engagement/public/index.ts',
  'domains/configuration/public/index.ts', 'domains/dispute/public/index.ts', 'domains/enterprise/public/index.ts',
  'domains/audit/public/index.ts', 'sdui/registry/public/index.ts',
] as const;

describe('canonical public contracts', () => {
  it('publishes deliberate bounded-context entry points without concrete infrastructure', () => {
    for (const entry of publicEntries) {
      const file = path.join(root, entry);
      expect(fs.existsSync(file)).toBe(true);
      const publicSource = fs.readFileSync(file, 'utf8');
      expect(publicSource).not.toContain('/infrastructure/');
      expect(publicSource).not.toContain('@prisma/client');
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
