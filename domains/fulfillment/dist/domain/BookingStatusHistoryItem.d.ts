import { BookingStatus } from './BookingStatus.js';
export interface BookingStatusHistoryItem {
    fromStatus: BookingStatus | null;
    toStatus: BookingStatus;
    timestamp: Date | string;
    actorId: number | string;
    note?: string;
}
//# sourceMappingURL=BookingStatusHistoryItem.d.ts.map