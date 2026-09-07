import { describe, expect, it } from 'vitest';
import {
  Money,
  applyBasisPointsToMinorUnits,
  percentToBasisPoints,
} from '@carbroz/foundation-kernel';
import {
  TaxCalculator,
  type FinancialConfiguration,
} from '@carbroz/domain-financials';

describe('CW5 financial money invariants', () => {
  it('converts percentages to integer basis points and applies deterministic minor-unit rounding', () => {
    expect(percentToBasisPoints(18)).toBe(1_800);
    expect(percentToBasisPoints(9.125)).toBe(913);
    expect(applyBasisPointsToMinorUnits(10_005, 1_800)).toBe(1_801);
    expect(applyBasisPointsToMinorUnits(1, 5_000)).toBe(1);
    expect(() => percentToBasisPoints(-1)).toThrow();
    expect(() => applyBasisPointsToMinorUnits(1.5, 1_800)).toThrow();
  });

  it('calculates intrastate and interstate invoice tax entirely in integer minor units', () => {
    const calculator = new TaxCalculator();
    const subtotal = Money.fromMinor(10_005, 'INR');

    const intra = calculator.calculateInvoiceTax(subtotal, false);
    expect(intra.cgst.amountMinor).toBe(900);
    expect(intra.sgst.amountMinor).toBe(900);
    expect(intra.igst.amountMinor).toBe(0);
    expect(intra.totalTax.amountMinor).toBe(1_800);
    expect(intra.totalPrice.amountMinor).toBe(11_805);
    expect(intra.totalPrice.currency).toBe('INR');

    const inter = calculator.calculateInvoiceTax(subtotal, true);
    expect(inter.cgst.amountMinor).toBe(0);
    expect(inter.sgst.amountMinor).toBe(0);
    expect(inter.igst.amountMinor).toBe(1_801);
    expect(inter.totalPrice.amountMinor).toBe(11_806);
  });

  it('preserves gross-based commission and TDS semantics with deterministic decimal-rate quantization', () => {
    const config: FinancialConfiguration = {
      cgstRatePercent: 9,
      sgstRatePercent: 9,
      igstRatePercent: 18,
      platformCommissionPercent: 15.25,
      tdsRatePercent: 1.5,
      sellerGstin: '29AAAAA0000A1Z5',
    };
    const calculator = new TaxCalculator(config);
    const result = calculator.calculatePartnerPayout(Money.fromMinor(12_345, 'INR'));

    expect(result.commission.amountMinor).toBe(1_883);
    expect(result.tds.amountMinor).toBe(185);
    expect(result.netPayout.amountMinor).toBe(10_277);
    expect(result.grossAmount.amountMinor).toBe(12_345);
    expect(result.grossAmount.currency).toBe('INR');
  });

  it('rejects unsafe or non-integer Money values at the canonical boundary', () => {
    expect(() => Money.fromMinor(10.5, 'INR')).toThrow();
    expect(() => Money.fromMinor(Number.MAX_SAFE_INTEGER + 1, 'INR')).toThrow();
    expect(() => Money.fromMinor(-1, 'INR')).toThrow();
  });
});
