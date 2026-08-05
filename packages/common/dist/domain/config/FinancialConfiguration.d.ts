export interface FinancialConfiguration {
    cgstRatePercent: number;
    sgstRatePercent: number;
    igstRatePercent: number;
    platformCommissionPercent: number;
    tdsRatePercent: number;
    sellerGstin: string;
}
export declare const DEFAULT_FINANCIAL_CONFIG: FinancialConfiguration;
