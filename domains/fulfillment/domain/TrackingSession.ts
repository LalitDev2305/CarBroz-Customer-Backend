import { TrackingStatus } from './TrackingStatus.js';
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

export class TrackingSession {
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

  constructor(props: TrackingSessionProps) {
    if (!props.bookingId) throw new Error('TrackingSession must be associated with a booking');
    if (!props.partnerId) throw new Error('TrackingSession must be associated with a partner');
    if (!props.customerId) throw new Error('TrackingSession must be associated with a customer');

    const ping = new LocationPing({
      latitude: props.currentLatitude,
      longitude: props.currentLongitude,
    });

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.partnerId = props.partnerId;
    this.customerId = props.customerId;
    this.currentLatitude = ping.latitude;
    this.currentLongitude = ping.longitude;
    this.heading = props.heading ?? null;
    this.speed = props.speed ?? null;
    this.etaMinutes = props.etaMinutes ?? null;
    this.status = props.status ?? 'ACTIVE';
    this.startedAt = props.startedAt ?? new Date();
    this.endedAt = props.endedAt ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  updateLocation(ping: LocationPing, etaMinutes?: number | null): void {
    if (this.status !== 'ACTIVE') {
      throw new Error(`Cannot update location for non-active tracking session (${this.status})`);
    }

    this.currentLatitude = ping.latitude;
    this.currentLongitude = ping.longitude;
    this.heading = ping.heading;
    this.speed = ping.speed;
    if (etaMinutes !== undefined) {
      this.etaMinutes = etaMinutes;
    }
  }

  get currentLocationPing(): LocationPing {
    return new LocationPing({
      latitude: this.currentLatitude,
      longitude: this.currentLongitude,
      heading: this.heading,
      speed: this.speed,
    });
  }

  complete(): void {
    if (this.status === 'COMPLETED') return;
    this.status = 'COMPLETED';
    this.endedAt = new Date();
  }

  cancel(): void {
    if (this.status === 'CANCELLED' || this.status === 'COMPLETED') return;
    this.status = 'CANCELLED';
    this.endedAt = new Date();
  }
}
