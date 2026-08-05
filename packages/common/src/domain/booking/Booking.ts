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

export class Booking {
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

  constructor(props: BookingProps) {
    if (!props.customerId) throw new Error('Booking must belong to a customer');
    if (!props.vehicleId) throw new Error('Booking requires a vehicle');
    if (!props.addressId) throw new Error('Booking requires an address');
    if (!props.serviceId) throw new Error('Booking requires a service');
    if (props.slotEndTime <= props.slotStartTime) {
      throw new Error('Slot end time must be after slot start time');
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.customerId = props.customerId;
    this.partnerId = props.partnerId ?? null;
    this.vehicleId = props.vehicleId;
    this.addressId = props.addressId;
    this.serviceId = props.serviceId;
    this.status = props.status ?? 'CREATED';
    this.slotStartTime = props.slotStartTime;
    this.slotEndTime = props.slotEndTime;
    this.expiryAt = props.expiryAt ?? null;
    this.totalPricePaise = props.totalPricePaise;
    this.cancellationReason = props.cancellationReason ?? null;
    this.snapshots = props.snapshots;
    this.statusHistory = props.statusHistory ?? [
      {
        fromStatus: null,
        toStatus: this.status,
        timestamp: new Date(),
        actorId: props.customerId,
        note: 'Booking slot created',
      },
    ];
    this.corporateAccountId = props.corporateAccountId ?? null;
    this.corporateFleetVehicleId = props.corporateFleetVehicleId ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  confirm(actorId: number): void {
    if (this.status !== 'CREATED') {
      throw new Error(`Cannot confirm booking in status ${this.status}`);
    }
    if (this.expiryAt && new Date() > this.expiryAt) {
      this.transitionTo('EXPIRED', actorId, 'Slot reservation expired');
      throw new Error('Cannot confirm an expired booking slot');
    }
    this.expiryAt = null;
    this.transitionTo('CONFIRMED', actorId, 'Booking confirmed by customer');
  }

  assignPartner(partnerId: number, actorId: number): void {
    if (this.status !== 'CONFIRMED' && this.status !== 'ASSIGNED') {
      throw new Error(`Cannot assign partner to booking in status ${this.status}`);
    }
    this.partnerId = partnerId;
    this.transitionTo('ASSIGNED', actorId, `Assigned to partner ${partnerId}`);
  }

  startService(actorId: number): void {
    if (this.status !== 'ASSIGNED') {
      throw new Error(`Cannot start service for booking in status ${this.status}`);
    }
    this.transitionTo('IN_PROGRESS', actorId, 'Service started');
  }

  completeService(actorId: number): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot complete service for booking in status ${this.status}`);
    }
    this.transitionTo('COMPLETED', actorId, 'Service completed successfully');
  }

  cancel(actorId: number, reason: string): void {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED' || this.status === 'EXPIRED') {
      throw new Error(`Cannot cancel booking in status ${this.status}`);
    }
    this.cancellationReason = reason;
    this.expiryAt = null;
    this.transitionTo('CANCELLED', actorId, `Cancelled: ${reason}`);
  }

  expire(actorId: number | string = 'SYSTEM'): void {
    if (this.status !== 'CREATED') return;
    this.expiryAt = null;
    this.transitionTo('EXPIRED', actorId, 'Slot hold expired automatically');
  }

  private transitionTo(newStatus: BookingStatus, actorId: number | string, note?: string): void {
    const fromStatus = this.status;
    this.status = newStatus;
    this.statusHistory.push({
      fromStatus,
      toStatus: newStatus,
      timestamp: new Date(),
      actorId,
      note,
    });
  }
}
