import {
  Money,
  applyBasisPointsToMinorUnits,
  percentToBasisPoints,
} from '@carbroz/foundation-kernel';
import { FinancialConfiguration, DEFAULT_FINANCIAL_CONFIG } from './FinancialConfiguration.js';

/** TaxCalculationResult is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface TaxCalculationResult {
  basePrice: Money;
  subtotal: Money;
  cgst: Money;
  sgst: Money;
  igst: Money;
  totalTax: Money;
  totalPrice: Money;
}

/** PayoutCalculationResult is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PayoutCalculationResult {
  grossAmount: Money;
  commissionPercentage: number;
  commission: Money;
  tdsPercentage: number;
  tds: Money;
  netPayout: Money;
  appliedRules: string[];
}

/** TaxCalculator is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export class TaxCalculator {
  constructor(private readonly config: FinancialConfiguration = DEFAULT_FINANCIAL_CONFIG) {}

  calculateInvoiceTax(subtotalMoney: Money, isInterstate = false): TaxCalculationResult {
    const currency = subtotalMoney.currency;
    const subtotalMinor = subtotalMoney.amountMinor;

    if (isInterstate) {
      const igstMinor = applyBasisPointsToMinorUnits(
        subtotalMinor,
        percentToBasisPoints(this.config.igstRatePercent),
      );
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

    const cgstMinor = applyBasisPointsToMinorUnits(
      subtotalMinor,
      percentToBasisPoints(this.config.cgstRatePercent),
    );
    const sgstMinor = applyBasisPointsToMinorUnits(
      subtotalMinor,
      percentToBasisPoints(this.config.sgstRatePercent),
    );
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
    const commissionMinor = applyBasisPointsToMinorUnits(
      grossMinor,
      percentToBasisPoints(this.config.platformCommissionPercent),
    );
    const tdsMinor = applyBasisPointsToMinorUnits(
      grossMinor,
      percentToBasisPoints(this.config.tdsRatePercent),
    );
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
