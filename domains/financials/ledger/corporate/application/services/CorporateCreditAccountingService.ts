import { DomainError } from "@carbroz/foundation-kernel";
import { CorporateCreditLedger } from "../../domain/CorporateCreditLedger.js";
import type { ICorporateCreditLedgerRepository } from "../../domain/repositories/ICorporateCreditLedgerRepository.js";
import type {
  CorporateBookingDebitInput,
  CorporateCreditAdjustmentInput,
  CorporateCreditGrantInput,
  CorporatePaymentCreditInput,
  ICorporateCreditAccountGateway,
  ICorporateCreditAccounting,
} from "../ports/CorporateCreditAccountingPorts.js";

/** Canonical Financials owner for corporate credit accounting and ledger writes. */
export class CorporateCreditAccountingService implements ICorporateCreditAccounting {
  constructor(
    private readonly corporateAccountRepo: ICorporateCreditAccountGateway,
    private readonly creditLedgerRepo: ICorporateCreditLedgerRepository,
  ) {}

  async recordCreditGrant(input: CorporateCreditGrantInput): Promise<void> {
    await this.creditLedgerRepo.create(
      new CorporateCreditLedger({
        corporateAccountId: input.corporateAccountId,
        entryType: "CREDIT_GRANTED",
        amountPaise: input.amountPaise,
        balanceAfterPaise: input.balanceAfterPaise,
        referenceNotes: input.referenceNotes,
      }),
    );
  }

  async recordCreditAdjustment(
    input: CorporateCreditAdjustmentInput,
  ): Promise<void> {
    await this.creditLedgerRepo.create(
      new CorporateCreditLedger({
        corporateAccountId: input.corporateAccountId,
        entryType: "ADJUSTMENT",
        amountPaise: input.amountPaise,
        balanceAfterPaise: input.balanceAfterPaise,
        referenceNotes: input.referenceNotes,
      }),
    );
  }

  async recordBookingDebit(input: CorporateBookingDebitInput): Promise<void> {
    if (input.amountPaise <= 0n)
      throw new DomainError("Corporate booking debit must be positive");
    const account = await this.corporateAccountRepo.findById(
      input.corporateAccountId,
    );
    if (!account) throw new DomainError("Corporate account not found");
    if (
      account.utilisedCreditPaise + input.amountPaise >
      account.creditLimitPaise
    ) {
      throw new DomainError("Corporate account credit limit exceeded");
    }

    const updated = await this.corporateAccountRepo.updateUtilisedCredit(
      input.corporateAccountId,
      input.amountPaise,
    );
    await this.creditLedgerRepo.create(
      new CorporateCreditLedger({
        corporateAccountId: input.corporateAccountId,
        bookingId: input.bookingId,
        entryType: "BOOKING_DEBIT",
        amountPaise: input.amountPaise,
        balanceAfterPaise:
          updated.creditLimitPaise - updated.utilisedCreditPaise,
        referenceNotes:
          input.referenceNotes ?? `Booking ID ${input.bookingId} credit debit`,
      }),
    );
  }

  async recordPaymentCredit(input: CorporatePaymentCreditInput): Promise<void> {
    if (input.amountPaise <= 0n)
      throw new DomainError("Corporate payment credit must be positive");
    const account = await this.corporateAccountRepo.findById(
      input.corporateAccountId,
    );
    if (!account) throw new DomainError("Corporate account not found");
    if (input.amountPaise > account.utilisedCreditPaise) {
      throw new DomainError("Corporate payment credit exceeds utilised credit");
    }

    const updated = await this.corporateAccountRepo.updateUtilisedCredit(
      input.corporateAccountId,
      -input.amountPaise,
    );
    await this.creditLedgerRepo.create(
      new CorporateCreditLedger({
        corporateAccountId: input.corporateAccountId,
        invoiceId: input.invoiceId,
        entryType: "PAYMENT_CREDIT",
        amountPaise: input.amountPaise,
        balanceAfterPaise:
          updated.creditLimitPaise - updated.utilisedCreditPaise,
        referenceNotes: input.referenceNotes,
      }),
    );
  }
}
