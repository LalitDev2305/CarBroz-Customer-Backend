import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const finalDescribe = existsSync('packages') ? describe.skip : describe;
const financialDomainFiles = [
  'domains/financials/payment/domain/Payment.ts',
  'domains/financials/invoice/domain/Invoice.ts',
  'domains/financials/payout/domain/PartnerPayout.ts',
];
const financialPublicFiles = [
  'domains/financials/payment/public/index.ts',
  'domains/financials/invoice/public/index.ts',
  'domains/financials/payout/public/index.ts',
  'domains/financials/public/index.ts',
];

finalDescribe('Financials architecture policy', () => {
  it('uses the Foundation Money value object for monetary aggregate invariants', () => {
    const violations = financialDomainFiles.filter((file) => {
      const source = readFileSync(file, 'utf8');
      return !source.includes("from '@carbroz/foundation-kernel'") || !source.includes('Money.fromMinor(');
    });
    expect(violations).toEqual([]);
  });

  it('does not publish concrete Financials infrastructure adapters', () => {
    expect(financialPublicFiles.filter((file) => readFileSync(file, 'utf8').includes('/infrastructure/'))).toEqual([]);
  });

  it('keeps one canonical Money implementation owned by Foundation with no compatibility implementation', () => {
    const money = readFileSync('foundation/kernel/src/domain/Money.ts', 'utf8');
    expect(money).toContain('amountMinor');
    expect(money).toContain('fromMinor');
    expect(money).not.toContain('amountPaise');
    expect(money).not.toContain('fromPaise');
    expect(existsSync('packages/common/src/domain/value-objects/Money.ts')).toBe(false);
  });
});
