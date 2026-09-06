import { describe, expect, it, vi } from 'vitest';
import { CorporateCreditAccountingService } from './CorporateCreditAccountingService.js';

const account = (overrides: Record<string, unknown> = {}) => ({
  id: 10,
  creditLimitPaise: 100_000n,
  utilisedCreditPaise: 20_000n,
  ...overrides,
});

function fixture() {
  const corporateAccountRepo = {
    findById: vi.fn(async () => account()),
    updateUtilisedCredit: vi.fn(async (_id: number, delta: bigint) => account({ utilisedCreditPaise: 20_000n + delta })),
  };
  const creditLedgerRepo = {
    create: vi.fn(async (entry: any) => entry),
  };
  return {
    corporateAccountRepo,
    creditLedgerRepo,
    service: new CorporateCreditAccountingService(corporateAccountRepo as any, creditLedgerRepo as any),
  };
}

describe('CorporateCreditAccountingService', () => {
  it('records credit grants and adjustments as Financials-owned ledger entries', async () => {
    const { service, creditLedgerRepo } = fixture();

    await service.recordCreditGrant({
      corporateAccountId: 10,
      amountPaise: 100_000n,
      balanceAfterPaise: 100_000n,
      referenceNotes: 'initial grant',
    });
    await service.recordCreditAdjustment({
      corporateAccountId: 10,
      amountPaise: -10_000n,
      balanceAfterPaise: 70_000n,
    });

    expect(creditLedgerRepo.create).toHaveBeenNthCalledWith(1, expect.objectContaining({
      corporateAccountId: 10,
      entryType: 'CREDIT_GRANTED',
      amountPaise: 100_000n,
      referenceNotes: 'initial grant',
    }));
    expect(creditLedgerRepo.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
      entryType: 'ADJUSTMENT',
      amountPaise: -10_000n,
      referenceNotes: null,
    }));
  });

  it('records a booking debit after enforcing account and credit invariants', async () => {
    const { service, corporateAccountRepo, creditLedgerRepo } = fixture();

    await service.recordBookingDebit({ corporateAccountId: 10, bookingId: 501, amountPaise: 15_000n });

    expect(corporateAccountRepo.updateUtilisedCredit).toHaveBeenCalledWith(10, 15_000n);
    expect(creditLedgerRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      bookingId: 501,
      entryType: 'BOOKING_DEBIT',
      amountPaise: 15_000n,
      balanceAfterPaise: 65_000n,
      referenceNotes: 'Booking ID 501 credit debit',
    }));
  });

  it('rejects invalid booking debits before persistence', async () => {
    const zero = fixture();
    await expect(zero.service.recordBookingDebit({ corporateAccountId: 10, bookingId: 1, amountPaise: 0n }))
      .rejects.toThrow('must be positive');

    const missing = fixture();
    missing.corporateAccountRepo.findById.mockResolvedValueOnce(null as any);
    await expect(missing.service.recordBookingDebit({ corporateAccountId: 10, bookingId: 1, amountPaise: 1n }))
      .rejects.toThrow('Corporate account not found');

    const exceeded = fixture();
    exceeded.corporateAccountRepo.findById.mockResolvedValueOnce(account({ utilisedCreditPaise: 95_000n }) as any);
    await expect(exceeded.service.recordBookingDebit({ corporateAccountId: 10, bookingId: 1, amountPaise: 10_000n }))
      .rejects.toThrow('credit limit exceeded');
  });

  it('records payment credit and restores available corporate credit', async () => {
    const { service, corporateAccountRepo, creditLedgerRepo } = fixture();

    await service.recordPaymentCredit({
      corporateAccountId: 10,
      invoiceId: 700,
      amountPaise: 5_000n,
      referenceNotes: 'NEFT-700',
    });

    expect(corporateAccountRepo.updateUtilisedCredit).toHaveBeenCalledWith(10, -5_000n);
    expect(creditLedgerRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      invoiceId: 700,
      entryType: 'PAYMENT_CREDIT',
      amountPaise: 5_000n,
      balanceAfterPaise: 85_000n,
      referenceNotes: 'NEFT-700',
    }));
  });

  it('rejects invalid payment credits before account mutation', async () => {
    const zero = fixture();
    await expect(zero.service.recordPaymentCredit({ corporateAccountId: 10, invoiceId: 1, amountPaise: 0n }))
      .rejects.toThrow('must be positive');

    const missing = fixture();
    missing.corporateAccountRepo.findById.mockResolvedValueOnce(null as any);
    await expect(missing.service.recordPaymentCredit({ corporateAccountId: 10, invoiceId: 1, amountPaise: 1n }))
      .rejects.toThrow('Corporate account not found');

    const exceeded = fixture();
    await expect(exceeded.service.recordPaymentCredit({ corporateAccountId: 10, invoiceId: 1, amountPaise: 25_000n }))
      .rejects.toThrow('exceeds utilised credit');
  });
});
