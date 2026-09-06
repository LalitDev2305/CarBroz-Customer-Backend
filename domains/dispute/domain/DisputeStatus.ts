/** DisputeStatus is an exported domains/dispute contract/implementation; see the owning README for lifecycle and extension rules. */
export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED_REFUNDED'
  | 'RESOLVED_REJECTED'
  | 'CANCELLED';
