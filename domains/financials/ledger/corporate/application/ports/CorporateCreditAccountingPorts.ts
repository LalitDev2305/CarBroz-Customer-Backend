export interface CorporateCreditAccountView {
  id?: number;
  creditLimitPaise: bigint;
  utilisedCreditPaise: bigint;
}

export interface ICorporateCreditAccountGateway {
  findById(id: number): Promise<CorporateCreditAccountView | null>;
  updateUtilisedCredit(id: number, deltaPaise: bigint): Promise<CorporateCreditAccountView>;
}

export interface CorporateCreditGrantInput {
  corporateAccountId: number;
  amountPaise: bigint;
  balanceAfterPaise: bigint;
  referenceNotes?: string;
}

export interface CorporateCreditAdjustmentInput extends CorporateCreditGrantInput {}

export interface CorporateBookingDebitInput {
  corporateAccountId: number;
  bookingId: number;
  amountPaise: bigint;
  referenceNotes?: string;
}

export interface CorporatePaymentCreditInput {
  corporateAccountId: number;
  invoiceId: number;
  amountPaise: bigint;
  referenceNotes?: string;
}

/** Financials accounting contract for every corporate credit-ledger mutation. */
export interface ICorporateCreditAccounting {
  recordCreditGrant(input: CorporateCreditGrantInput): Promise<void>;
  recordCreditAdjustment(input: CorporateCreditAdjustmentInput): Promise<void>;
  recordBookingDebit(input: CorporateBookingDebitInput): Promise<void>;
  recordPaymentCredit(input: CorporatePaymentCreditInput): Promise<void>;
}
