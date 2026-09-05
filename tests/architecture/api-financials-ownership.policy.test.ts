import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const legacyUseCases = [
  'apps/api/src/modules/payment/use-cases/CreatePaymentOrderUseCase.ts',
  'apps/api/src/modules/payment/use-cases/GetPaymentUseCase.ts',
  'apps/api/src/modules/payment/use-cases/ProcessPaymentWebhookUseCase.ts',
  'apps/api/src/modules/invoice/use-cases/GenerateInvoiceUseCase.ts',
  'apps/api/src/modules/invoice/use-cases/GetInvoiceUseCase.ts',
  'apps/api/src/modules/payout/use-cases/CreatePayoutEligibilityUseCase.ts',
  'apps/api/src/modules/payout/use-cases/ListPartnerPayoutsUseCase.ts',
  'apps/api/src/modules/payout/use-cases/MarkPayoutPaidUseCase.ts',
  'apps/api/src/modules/payout/use-cases/ProcessPayoutBatchUseCase.ts',
];

const finalDescribe = existsSync('packages') ? describe.skip : describe;

finalDescribe('API Financials ownership policy', () => {
  it('removes Financials application behavior from apps/api', () => {
    expect(legacyUseCases.filter(existsSync)).toEqual([]);
    for (const root of ['apps/api/src/modules/payment', 'apps/api/src/modules/invoice', 'apps/api/src/modules/payout']) {
      expect(existsSync(root)).toBe(false);
    }
  });

  it('keeps Financials implementation authority inside domains/financials/application', () => {
    const source = readFileSync('domains/financials/application/FinancialUseCases.ts', 'utf8');
    for (const owner of [
      'CreatePaymentOrderUseCase', 'GetPaymentUseCase', 'ProcessPaymentWebhookUseCase',
      'GenerateInvoiceUseCase', 'GetInvoiceUseCase', 'CreatePayoutEligibilityUseCase',
      'ListPartnerPayoutsUseCase', 'MarkPayoutPaidUseCase', 'ProcessPayoutBatchUseCase',
    ]) expect(source).toContain(`class ${owner}`);
  });
});
