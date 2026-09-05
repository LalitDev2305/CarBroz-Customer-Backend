import { Money } from '../value-objects/Money.js';
import { FinancialConfiguration, DEFAULT_FINANCIAL_CONFIG } from '../config/FinancialConfiguration.js';

export interface TaxCalculationResult {
  basePrice: Money;
  subtotal: Money;
  cgst: Money;
  sgst: Money;
  igst: Money;
  totalTax: Money;
  totalPrice: Money;
}

export interface PayoutCalculationResult {
  grossAmount: Money;
  commissionPercentage: number;
  commission: Money;
  tdsPercentage: number;
  tds: Money;
  netPayout: Money;
  appliedRules: string[];
}

export class TaxCalculator {
  constructor(private readonly config: FinancialConfiguration = DEFAULT_FINANCIAL_CONFIG) {}

  calculateInvoiceTax(subtotalMoney: Money, isInterstate = false): TaxCalculationResult {
    const currency = subtotalMoney.currency;
    const subtotalMinor = subtotalMoney.amountMinor;

    if (isInterstate) {
      const igstMinor = Math.round((subtotalMinor * this.config.igstRatePercent) / 100);
      const totalTaxMinor = igstMinor;
      return {
        basePrice: subtotalMoney,
        subtotal: subtotalMoney,
        cgst: Money.zero(currency),
        sgst: Money.zero(currency),
        igst: Money.fromMinor(igstMinor, currency),
        totalTax: Money.fromMinor(totalTaxMinor, currency),
        totalPrice: Money.fromMinor(subtotalMinor + totalTaxMinor, currency),
      };
    }

    const cgstMinor = Math.round((subtotalMinor * this.config.cgstRatePercent) / 100);
    const sgstMinor = Math.round((subtotalMinor * this.config.sgstRatePercent) / 100);
    const totalTaxMinor = cgstMinor + sgstMinor;
    return {
      basePrice: subtotalMoney,
      subtotal: subtotalMoney,
      cgst: Money.fromMinor(cgstMinor, currency),
      sgst: Money.fromMinor(sgstMinor, currency),
      igst: Money.zero(currency),
      totalTax: Money.fromMinor(totalTaxMinor, currency),
      totalPrice: Money.fromMinor(subtotalMinor + totalTaxMinor, currency),
    };
  }

  calculatePartnerPayout(grossMoney: Money): PayoutCalculationResult {
    const currency = grossMoney.currency;
    const grossMinor = grossMoney.amountMinor;
    const commissionMinor = Math.round((grossMinor * this.config.platformCommissionPercent) / 100);
    const tdsMinor = Math.round((grossMinor * this.config.tdsRatePercent) / 100);
    const netPayoutMinor = grossMinor - commissionMinor - tdsMinor;

    return {
      grossAmount: grossMoney,
      commissionPercentage: this.config.platformCommissionPercent,
      commission: Money.fromMinor(commissionMinor, currency),
      tdsPercentage: this.config.tdsRatePercent,
      tds: Money.fromMinor(tdsMinor, currency),
      netPayout: Money.fromMinor(netPayoutMinor, currency),
      appliedRules: [
        `Platform Commission: ${this.config.platformCommissionPercent}%`,
        `TDS u/s 194O: ${this.config.tdsRatePercent}%`,
      ],
    };
  }
}
