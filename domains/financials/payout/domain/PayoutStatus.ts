/** PayoutStatus is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export type PayoutStatus =
  | 'SCHEDULED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED';
