export interface CorporateCreditGrantRecord {
  corporateAccountId: number;
  amountPaise: bigint;
  balanceAfterPaise: bigint;
  referenceNotes?: string;
}

export interface CorporateCreditAdjustmentRecord {
  corporateAccountId: number;
  amountPaise: bigint;
  balanceAfterPaise: bigint;
  referenceNotes?: string;
}

/**
 * Enterprise-owned driven port for recording the financial consequence of
 * corporate credit policy decisions. Enterprise decides eligibility/limits;
 * Financials owns the accounting implementation and ledger persistence.
 */
export interface ICorporateCreditAccountingPort {
  recordCreditGrant(input: CorporateCreditGrantRecord): Promise<void>;
  recordCreditAdjustment(input: CorporateCreditAdjustmentRecord): Promise<void>;
}
