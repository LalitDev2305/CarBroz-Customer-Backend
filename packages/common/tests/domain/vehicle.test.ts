import { describe, expect, it } from 'vitest';
import { Vehicle } from '../../src/domain/vehicle/Vehicle.js';

describe('Vehicle Domain Entity', () => {
  it('should initialize active vehicle correctly', () => {
    const v = new Vehicle({
      customerId: 1,
      make: 'Honda',
      model: 'City',
      year: 2022,
      registrationNumber: 'ka01ab1234',
      fuelType: 'PETROL',
    });

    expect(v.make).toBe('Honda');
    expect(v.registrationNumber).toBe('KA01AB1234'); // Normalized
    expect(v.status).toBe('ACTIVE');
    expect(v.isBookable()).toBe(true);
  });

  it('should throw error when missing customerId or registrationNumber', () => {
    expect(() => new Vehicle({ customerId: 0, make: 'Honda', model: 'City', year: 2022, registrationNumber: 'KA01', fuelType: 'PETROL' })).toThrow();
    expect(() => new Vehicle({ customerId: 1, make: 'Honda', model: 'City', year: 2022, registrationNumber: '', fuelType: 'PETROL' })).toThrow();
  });

  it('should set archived state and prevent booking', () => {
    const v = new Vehicle({
      customerId: 1,
      make: 'Honda',
      model: 'City',
      year: 2022,
      registrationNumber: 'KA01AB1234',
      fuelType: 'PETROL',
    });

    v.archive();
    expect(v.status).toBe('ARCHIVED');
    expect(v.deletedAt).toBeInstanceOf(Date);
    expect(v.isBookable()).toBe(false);
  });
});
