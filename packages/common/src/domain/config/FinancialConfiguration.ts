export interface FinancialConfiguration {
  cgstRatePercent: number;
  sgstRatePercent: number;
  igstRatePercent: number;
  platformCommissionPercent: number;
  tdsRatePercent: number;
  sellerGstin: string;
}

export const DEFAULT_FINANCIAL_CONFIG: FinancialConfiguration = {
  cgstRatePercent: 9,
  sgstRatePercent: 9,
  igstRatePercent: 18,
  platformCommissionPercent: 15,
  tdsRatePercent: 1,
  sellerGstin: '29AAAAA0000A1Z5',
};
