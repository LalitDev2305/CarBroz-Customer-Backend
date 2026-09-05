import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const FINANCIAL_DOMAIN_FILES = [
  'domains/financials/payment/domain/Payment.ts',
  'domains/financials/invoice/domain/Invoice.ts',
  'domains/financials/payout/domain/PartnerPayout.ts',
];

const FINANCIAL_PUBLIC_FILES = [
  'domains/financials/payment/public/index.ts',
  'domains/financials/invoice/public/index.ts',
  'domains/financials/payout/public/index.ts',
  'domains/financials/public/index.ts',
];

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('Financials architecture policy', () => {
  it('uses the Foundation Money value object for monetary aggregate invariants', () => {
    const violations = FINANCIAL_DOMAIN_FILES.filter((path) => {
      const source = read(path);
      return !source.includes("from '@carbroz/foundation-kernel'") || !source.includes('Money.fromMinor(');
    });

    expect(
      violations,
      `Financial domain aggregates bypass canonical Foundation Money:\n${violations.join('\n')}`,
    ).toEqual([]);
  });

  it('does not publish concrete Financials infrastructure adapters', () => {
    const violations = FINANCIAL_PUBLIC_FILES.filter((path) => read(path).includes('/infrastructure/'));

    expect(
      violations,
      `Financial public barrels expose concrete infrastructure:\n${violations.join('\n')}`,
    ).toEqual([]);
  });

  it('keeps one canonical Money implementation owned by Foundation', () => {
    const money = read('foundation/kernel/src/domain/Money.ts');
    expect(money).toContain('amountMinor');
    expect(money).toContain('fromMinor');
    expect(money).not.toContain('amountPaise');
    expect(money).not.toContain('fromPaise');

    const compatibilityMoney = read('packages/common/src/domain/value-objects/Money.ts');
    expect(compatibilityMoney).toContain("export { Money } from '@carbroz/foundation-kernel'");
    expect(compatibilityMoney).not.toContain('export class Money');
  });
});
