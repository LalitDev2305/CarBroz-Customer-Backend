/** BookingStatus is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export type BookingStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';
