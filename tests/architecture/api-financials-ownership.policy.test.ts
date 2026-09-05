import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const API_FINANCIAL_USE_CASES = [
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

function read(path: string): string {
  return readFileSync(path, 'utf8').trim();
}

describe('API Financials ownership policy', () => {
  it('keeps Financials application behavior out of apps/api', () => {
    const violations = API_FINANCIAL_USE_CASES.filter((path) => {
      const source = read(path);
      return !source.includes("from '@carbroz/domain-financials'") || /\bclass\s+\w+UseCase\b/.test(source);
    });

    expect(
      violations,
      `Financial application behavior leaked back into apps/api:\n${violations.join('\n')}`,
    ).toEqual([]);
  });

  it('keeps Financials implementation authority inside domains/financials/application', () => {
    const source = read('domains/financials/application/FinancialUseCases.ts');
    const requiredOwners = [
      'CreatePaymentOrderUseCase',
      'GetPaymentUseCase',
      'ProcessPaymentWebhookUseCase',
      'GenerateInvoiceUseCase',
      'GetInvoiceUseCase',
      'CreatePayoutEligibilityUseCase',
      'ListPartnerPayoutsUseCase',
      'MarkPayoutPaidUseCase',
      'ProcessPayoutBatchUseCase',
    ];

    const missing = requiredOwners.filter((name) => !source.includes(`class ${name}`));
    expect(missing, `Financial use-case owners missing from domain application layer:\n${missing.join('\n')}`).toEqual([]);
  });
});
