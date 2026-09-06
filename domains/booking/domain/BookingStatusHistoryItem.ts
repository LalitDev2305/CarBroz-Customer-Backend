import { BookingStatus } from './BookingStatus.js';

/** BookingStatusHistoryItem is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export interface BookingStatusHistoryItem {
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  timestamp: Date | string;
  actorId: number | string;
  note?: string;
}
