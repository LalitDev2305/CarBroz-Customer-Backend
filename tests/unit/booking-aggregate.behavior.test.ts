import { describe, expect, it } from 'vitest';
import { Booking } from '@carbroz/domain-booking';

const snapshots: any = {
  service: { serviceId: 1, name: 'Wash', basePricePaise: 1000, estimatedDurationMinutes: 60 },
  addons: [],
  pricing: { basePricePaise: 1000, addonsTotalPaise: 0, vehicleMultiplier: 1, subtotalPaise: 1000, taxesPaise: 180, totalPricePaise: 1180 },
  address: { addressLine1: 'A', addressLine2: null, city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN', latitude: null, longitude: null },
  vehicle: { make: 'Tata', model: 'Nexon', variant: null, year: 2025, registrationNumber: 'MH01AB1234', fuelType: 'PETROL' },
};

function props(overrides: Record<string, unknown> = {}) {
  return {
    customerId: 7,
    vehicleId: 2,
    addressId: 3,
    serviceId: 4,
    slotStartTime: new Date('2030-01-01T10:00:00Z'),
    slotEndTime: new Date('2030-01-01T11:00:00Z'),
    totalPricePaise: 1180,
    snapshots,
    ...overrides,
  } as any;
}

describe('Booking aggregate invariants', () => {
  it('rejects missing required ownership and invalid slot ordering', () => {
    expect(() => new Booking(props({ customerId: 0 }))).toThrow('Booking must belong to a customer');
    expect(() => new Booking(props({ vehicleId: 0 }))).toThrow('Booking requires a vehicle');
    expect(() => new Booking(props({ addressId: 0 }))).toThrow('Booking requires an address');
    expect(() => new Booking(props({ serviceId: 0 }))).toThrow('Booking requires a service');
    expect(() => new Booking(props({ slotStartTime: new Date('2030-01-01T11:00:00Z'), slotEndTime: new Date('2030-01-01T11:00:00Z') }))).toThrow('Slot end time must be after slot start time');
  });

  it('applies constructor defaults and preserves explicit persisted values', () => {
    const created = new Booking(props());
    expect(created).toMatchObject({ partnerId: null, status: 'CREATED', expiryAt: null, cancellationReason: null, corporateAccountId: null, corporateFleetVehicleId: null });
    expect(created.statusHistory).toHaveLength(1);
    expect(created.statusHistory[0]).toMatchObject({ fromStatus: null, toStatus: 'CREATED', actorId: 7, note: 'Booking slot created' });

    const history: any[] = [{ fromStatus: 'CREATED', toStatus: 'CONFIRMED', timestamp: new Date(), actorId: 7, note: 'old' }];
    const persisted = new Booking(props({ id: 9, publicId: 'bk-1', partnerId: 22, status: 'CONFIRMED', expiryAt: new Date('2030-01-01'), cancellationReason: 'old', statusHistory: history, corporateAccountId: 33, corporateFleetVehicleId: 44, createdAt: new Date('2029-01-01'), updatedAt: new Date('2029-02-01') }));
    expect(persisted).toMatchObject({ id: 9, publicId: 'bk-1', partnerId: 22, status: 'CONFIRMED', cancellationReason: 'old', corporateAccountId: 33, corporateFleetVehicleId: 44 });
    expect(persisted.statusHistory).toBe(history);
  });

  it('confirms a CREATED booking, clears expiry and records history', () => {
    const booking = new Booking(props({ expiryAt: new Date('2030-01-01T09:59:59Z') }));
    booking.confirm(7);
    expect(booking.status).toBe('CONFIRMED');
    expect(booking.expiryAt).toBeNull();
    expect(booking.statusHistory.at(-1)).toMatchObject({ fromStatus: 'CREATED', toStatus: 'CONFIRMED', actorId: 7, note: 'Booking confirmed by customer' });
  });

  it('rejects confirm outside CREATED and expires an elapsed slot before rejecting confirmation', () => {
    expect(() => new Booking(props({ status: 'CONFIRMED' })).confirm(7)).toThrow('Cannot confirm booking in status CONFIRMED');
    const expired = new Booking(props({ expiryAt: new Date('2020-01-01T00:00:00Z') }));
    expect(() => expired.confirm(7)).toThrow('Cannot confirm an expired booking slot');
    expect(expired.status).toBe('EXPIRED');
    expect(expired.statusHistory.at(-1)).toMatchObject({ toStatus: 'EXPIRED', note: 'Slot reservation expired' });
  });

  it('assigns and reassigns a partner only from CONFIRMED/ASSIGNED', () => {
    expect(() => new Booking(props()).assignPartner(22, 1)).toThrow('Cannot assign partner to booking in status CREATED');
    for (const status of ['CONFIRMED', 'ASSIGNED'] as const) {
      const booking = new Booking(props({ status }));
      booking.assignPartner(22, 1);
      expect(booking.partnerId).toBe(22);
      expect(booking.status).toBe('ASSIGNED');
      expect(booking.statusHistory.at(-1)).toMatchObject({ toStatus: 'ASSIGNED', actorId: 1, note: 'Assigned to partner 22' });
    }
  });

  it('enforces ASSIGNED -> IN_PROGRESS -> COMPLETED service lifecycle', () => {
    expect(() => new Booking(props({ status: 'CONFIRMED' })).startService(22)).toThrow('Cannot start service for booking in status CONFIRMED');
    const booking = new Booking(props({ status: 'ASSIGNED', partnerId: 22 }));
    booking.startService(22);
    expect(booking.status).toBe('IN_PROGRESS');
    expect(() => new Booking(props({ status: 'ASSIGNED' })).completeService(22)).toThrow('Cannot complete service for booking in status ASSIGNED');
    booking.completeService(22);
    expect(booking.status).toBe('COMPLETED');
    expect(booking.statusHistory.at(-1)).toMatchObject({ fromStatus: 'IN_PROGRESS', toStatus: 'COMPLETED', actorId: 22 });
  });

  it.each(['COMPLETED', 'CANCELLED', 'EXPIRED'] as const)('rejects cancellation from terminal status %s', (status) => {
    expect(() => new Booking(props({ status })).cancel(7, 'reason')).toThrow(`Cannot cancel booking in status ${status}`);
  });

  it('cancels a mutable booking, clears expiry and records reason/history', () => {
    const booking = new Booking(props({ status: 'CONFIRMED', expiryAt: new Date('2030-01-01') }));
    booking.cancel(7, 'changed plan');
    expect(booking).toMatchObject({ status: 'CANCELLED', cancellationReason: 'changed plan', expiryAt: null });
    expect(booking.statusHistory.at(-1)).toMatchObject({ fromStatus: 'CONFIRMED', toStatus: 'CANCELLED', actorId: 7, note: 'Cancelled: changed plan' });
  });

  it('expires CREATED bookings with default/explicit actors and ignores non-CREATED bookings', () => {
    const system = new Booking(props({ expiryAt: new Date('2030-01-01') }));
    system.expire();
    expect(system.status).toBe('EXPIRED');
    expect(system.statusHistory.at(-1)).toMatchObject({ actorId: 'SYSTEM', note: 'Slot hold expired automatically' });

    const explicit = new Booking(props());
    explicit.expire(99);
    expect(explicit.statusHistory.at(-1)?.actorId).toBe(99);

    const confirmed = new Booking(props({ status: 'CONFIRMED' }));
    const before = confirmed.statusHistory.length;
    confirmed.expire();
    expect(confirmed.status).toBe('CONFIRMED');
    expect(confirmed.statusHistory).toHaveLength(before);
  });
});
