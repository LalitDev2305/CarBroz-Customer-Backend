import { describe, it, expect } from 'vitest';
import { Booking } from '../src/public/index.js';


describe('@carbroz/domain-booking - Booking Entity', () => {
  it('should initialize booking aggregate cleanly with status history', () => {
    const now = new Date();
    const later = new Date(now.getTime() + 3600000);
    const booking = new Booking({
      customerId: 10,
      partnerId: 20,
      serviceId: 30,
      vehicleId: 40,
      addressId: 50,
      status: 'CONFIRMED',
      slotStartTime: now,
      slotEndTime: later,
      totalPricePaise: 150000,
      snapshots: {
        service: { serviceId: 30, name: 'General Service', basePricePaise: 100000, estimatedDurationMinutes: 60 },
        addons: [],
        pricing: { basePricePaise: 100000, addonsTotalPaise: 0, vehicleMultiplier: 1.5, subtotalPaise: 150000, taxesPaise: 0, totalPricePaise: 150000 },
        address: { addressLine1: 'Street 1', city: 'City', state: 'State', postalCode: '100001', country: 'IN' },
        vehicle: { make: 'Toyota', model: 'Camry', year: 2022, registrationNumber: 'KA01AB1234', fuelType: 'PETROL' },
      },

    });

    expect(booking.customerId).toBe(10);
    expect(booking.status).toBe('CONFIRMED');
    expect(booking.totalPricePaise).toBe(150000);
  });
});


