import { describe, expect, it } from 'vitest';
import { Booking } from '../../src/domain/booking/Booking.js';
import { BookingSnapshots } from '../../src/domain/booking/BookingSnapshots.js';

describe('Booking Domain Aggregate', () => {
  const dummySnapshots: BookingSnapshots = {
    service: { serviceId: 1, name: 'Full Car Wash', basePricePaise: 49900, estimatedDurationMinutes: 60 },
    addons: [],
    pricing: { basePricePaise: 49900, addonsTotalPaise: 0, vehicleMultiplier: 1.0, subtotalPaise: 49900, taxesPaise: 8982, totalPricePaise: 58882 },
    address: { addressLine1: '123 Main St', city: 'Bangalore', state: 'Karnataka', postalCode: '560001', country: 'India' },
    vehicle: { make: 'Hyundai', model: 'Creta', year: 2021, registrationNumber: 'KA02CD5678', fuelType: 'DIESEL' },
  };

  it('should initialize booking aggregate in CREATED state with history item', () => {
    const start = new Date(Date.now() + 3600000);
    const end = new Date(Date.now() + 7200000);

    const b = new Booking({
      customerId: 10,
      vehicleId: 5,
      addressId: 2,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: end,
      totalPricePaise: 58882,
      snapshots: dummySnapshots,
    });

    expect(b.status).toBe('CREATED');
    expect(b.statusHistory.length).toBe(1);
    expect(b.statusHistory[0].toStatus).toBe('CREATED');
  });

  it('should reject slotEndTime <= slotStartTime', () => {
    const start = new Date(Date.now() + 3600000);
    expect(() => new Booking({
      customerId: 10,
      vehicleId: 5,
      addressId: 2,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: start,
      totalPricePaise: 58882,
      snapshots: dummySnapshots,
    })).toThrow();
  });

  it('should enforce state transitions CREATED -> CONFIRMED -> ASSIGNED -> IN_PROGRESS -> COMPLETED', () => {
    const start = new Date(Date.now() + 3600000);
    const end = new Date(Date.now() + 7200000);

    const b = new Booking({
      customerId: 10,
      vehicleId: 5,
      addressId: 2,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: end,
      totalPricePaise: 58882,
      snapshots: dummySnapshots,
    });

    b.confirm(10);
    expect(b.status).toBe('CONFIRMED');

    b.assignPartner(99, 1);
    expect(b.status).toBe('ASSIGNED');
    expect(b.partnerId).toBe(99);

    b.startService(99);
    expect(b.status).toBe('IN_PROGRESS');

    b.completeService(99);
    expect(b.status).toBe('COMPLETED');
    expect(b.statusHistory.length).toBe(5);
  });

  it('should record cancellation reason when cancelled', () => {
    const start = new Date(Date.now() + 3600000);
    const end = new Date(Date.now() + 7200000);

    const b = new Booking({
      customerId: 10,
      vehicleId: 5,
      addressId: 2,
      serviceId: 1,
      slotStartTime: start,
      slotEndTime: end,
      totalPricePaise: 58882,
      snapshots: dummySnapshots,
    });

    b.cancel(10, 'Customer changed plans');
    expect(b.status).toBe('CANCELLED');
    expect(b.cancellationReason).toBe('Customer changed plans');
  });
});
