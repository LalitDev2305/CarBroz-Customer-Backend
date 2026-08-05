import { Money } from '../value-objects/Money.js';
import { DEFAULT_FINANCIAL_CONFIG } from '../config/FinancialConfiguration.js';
export class TaxCalculator {
    config;
    constructor(config = DEFAULT_FINANCIAL_CONFIG) {
        this.config = config;
    }
    calculateInvoiceTax(subtotalMoney, isInterstate = false) {
        const currency = subtotalMoney.currency;
        const subtotalPaise = subtotalMoney.amountPaise;
        if (isInterstate) {
            const igstPaise = Math.round((subtotalPaise * this.config.igstRatePercent) / 100);
            const totalTaxPaise = igstPaise;
            return {
                basePrice: subtotalMoney,
                subtotal: subtotalMoney,
                cgst: Money.zero(currency),
                sgst: Money.zero(currency),
                igst: Money.fromPaise(igstPaise, currency),
                totalTax: Money.fromPaise(totalTaxPaise, currency),
                totalPrice: Money.fromPaise(subtotalPaise + totalTaxPaise, currency),
            };
        }
        else {
            const cgstPaise = Math.round((subtotalPaise * this.config.cgstRatePercent) / 100);
            const sgstPaise = Math.round((subtotalPaise * this.config.sgstRatePercent) / 100);
            const totalTaxPaise = cgstPaise + sgstPaise;
            return {
                basePrice: subtotalMoney,
                subtotal: subtotalMoney,
                cgst: Money.fromPaise(cgstPaise, currency),
                sgst: Money.fromPaise(sgstPaise, currency),
                igst: Money.zero(currency),
                totalTax: Money.fromPaise(totalTaxPaise, currency),
                totalPrice: Money.fromPaise(subtotalPaise + totalTaxPaise, currency),
            };
        }
    }
    calculatePartnerPayout(grossMoney) {
        const currency = grossMoney.currency;
        const grossPaise = grossMoney.amountPaise;
        const commissionPaise = Math.round((grossPaise * this.config.platformCommissionPercent) / 100);
        const tdsPaise = Math.round((grossPaise * this.config.tdsRatePercent) / 100);
        const netPayoutPaise = grossPaise - commissionPaise - tdsPaise;
        return {
            grossAmount: grossMoney,
            commissionPercentage: this.config.platformCommissionPercent,
            commission: Money.fromPaise(commissionPaise, currency),
            tdsPercentage: this.config.tdsRatePercent,
            tds: Money.fromPaise(tdsPaise, currency),
            netPayout: Money.fromPaise(netPayoutPaise, currency),
            appliedRules: [
                `Platform Commission: ${this.config.platformCommissionPercent}%`,
                `TDS u/s 194O: ${this.config.tdsRatePercent}%`,
            ],
        };
    }
}
//# sourceMappingURL=TaxCalculator.js.map