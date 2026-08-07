import { BookingStatus } from './BookingStatus.js';
import { BookingStatusHistoryItem } from './BookingStatusHistoryItem.js';
import { BookingSnapshots } from './BookingSnapshots.js';
export interface BookingProps {
    id?: number;
    publicId?: string;
    customerId: number;
    partnerId?: number | null;
    vehicleId: number;
    addressId: number;
    serviceId: number;
    status?: BookingStatus;
    slotStartTime: Date;
    slotEndTime: Date;
    expiryAt?: Date | null;
    totalPricePaise: number;
    cancellationReason?: string | null;
    snapshots: BookingSnapshots;
    statusHistory?: BookingStatusHistoryItem[];
    corporateAccountId?: number | null;
    corporateFleetVehicleId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Booking {
    id?: number;
    publicId?: string;
    customerId: number;
    partnerId: number | null;
    vehicleId: number;
    addressId: number;
    serviceId: number;
    status: BookingStatus;
    slotStartTime: Date;
    slotEndTime: Date;
    expiryAt: Date | null;
    totalPricePaise: number;
    cancellationReason: string | null;
    snapshots: BookingSnapshots;
    statusHistory: BookingStatusHistoryItem[];
    corporateAccountId: number | null;
    corporateFleetVehicleId: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(props: BookingProps);
    confirm(actorId: number): void;
    assignPartner(partnerId: number, actorId: number): void;
    startService(actorId: number): void;
    completeService(actorId: number): void;
    cancel(actorId: number, reason: string): void;
    expire(actorId?: number | string): void;
    private transitionTo;
}
//# sourceMappingURL=Booking.d.ts.map