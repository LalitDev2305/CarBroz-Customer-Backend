export interface CorporateBillingAccountSnapshot {
  id?: number;
  publicId?: string;
  gstin: string;
  creditLimitPaise: bigint;
  utilisedCreditPaise: bigint;
}

/** Financials-facing read port for Enterprise-owned corporate account state needed by invoicing. */
export interface CorporateAccountBillingPort {
  findByPublicId(publicId: string): Promise<CorporateBillingAccountSnapshot | null>;
}

export interface FinancialAuditLogInput {
  actorId: number;
  actorType: string;
  action: string;
  resource: string;
  resourcePublicId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

/** Narrow audit port; the Audit bounded context supplies the runtime implementation at composition. */
export interface FinancialAuditLogPort {
  log(input: FinancialAuditLogInput): Promise<unknown>;
}
