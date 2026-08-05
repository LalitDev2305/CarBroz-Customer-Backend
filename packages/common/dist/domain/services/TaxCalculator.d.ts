import { Money } from '../value-objects/Money.js';
import { FinancialConfiguration } from '../config/FinancialConfiguration.js';
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
export declare class TaxCalculator {
    private readonly config;
    constructor(config?: FinancialConfiguration);
    calculateInvoiceTax(subtotalMoney: Money, isInterstate?: boolean): TaxCalculationResult;
    calculatePartnerPayout(grossMoney: Money): PayoutCalculationResult;
}
