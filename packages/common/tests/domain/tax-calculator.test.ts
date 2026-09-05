import { describe, expect, it } from 'vitest';
import { TaxCalculator } from '../../src/domain/services/TaxCalculator.js';
import { Money } from '../../src/domain/value-objects/Money.js';

describe('TaxCalculator Service', () => {
  it('should calculate intrastate GST split (CGST 9% + SGST 9%)', () => {
    const calc = new TaxCalculator();
    const subtotal = Money.fromMinor(40000, 'INR');

    const result = calc.calculateInvoiceTax(subtotal, false);

    expect(result.cgst.amountMinor).toBe(3600);
    expect(result.sgst.amountMinor).toBe(3600);
    expect(result.igst.amountMinor).toBe(0);
    expect(result.totalTax.amountMinor).toBe(7200);
    expect(result.totalPrice.amountMinor).toBe(47200);
  });

  it('should calculate interstate IGST (18%)', () => {
    const calc = new TaxCalculator();
    const subtotal = Money.fromMinor(40000, 'INR');

    const result = calc.calculateInvoiceTax(subtotal, true);

    expect(result.cgst.amountMinor).toBe(0);
    expect(result.sgst.amountMinor).toBe(0);
    expect(result.igst.amountMinor).toBe(7200);
    expect(result.totalTax.amountMinor).toBe(7200);
    expect(result.totalPrice.amountMinor).toBe(47200);
  });

  it('should calculate partner payout with config-driven commission (15%) & TDS (1%)', () => {
    const calc = new TaxCalculator({
      cgstRatePercent: 9,
      sgstRatePercent: 9,
      igstRatePercent: 18,
      platformCommissionPercent: 15,
      tdsRatePercent: 1,
      sellerGstin: 'GSTIN123',
    });

    const gross = Money.fromMinor(47200, 'INR');
    const payout = calc.calculatePartnerPayout(gross);

    expect(payout.commission.amountMinor).toBe(7080);
    expect(payout.tds.amountMinor).toBe(472);
    expect(payout.netPayout.amountMinor).toBe(39648);
  });
});
