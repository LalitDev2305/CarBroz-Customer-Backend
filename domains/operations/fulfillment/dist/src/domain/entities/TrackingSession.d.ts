import { TrackingStatus } from '../enums/TrackingStatus.js';
import { LocationPing } from './LocationPing.js';
export interface TrackingSessionProps {
    id?: number;
    publicId?: string;
    bookingId: number;
    partnerId: number;
    customerId: number;
    currentLatitude: number;
    currentLongitude: number;
    heading?: number | null;
    speed?: number | null;
    etaMinutes?: number | null;
    status?: TrackingStatus;
    startedAt?: Date;
    endedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class TrackingSession {
    id?: number;
    publicId?: string;
    bookingId: number;
    partnerId: number;
    customerId: number;
    currentLatitude: number;
    currentLongitude: number;
    heading: number | null;
    speed: number | null;
    etaMinutes: number | null;
    status: TrackingStatus;
    startedAt: Date;
    endedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(props: TrackingSessionProps);
    updateLocation(ping: LocationPing, etaMinutes?: number | null): void;
    get currentLocationPing(): LocationPing;
    complete(): void;
    cancel(): void;
}
