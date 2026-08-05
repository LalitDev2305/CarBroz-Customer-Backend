import { describe, expect, it } from 'vitest';
import { LocationPing, TrackingSession } from '../../src/index.js';

describe('Phase 18 — LocationPing Value Object', () => {
  it('should create valid location ping', () => {
    const ping = LocationPing.create(12.9716, 77.5946, 90, 45);
    expect(ping.latitude).toBe(12.9716);
    expect(ping.longitude).toBe(77.5946);
    expect(ping.heading).toBe(90);
    expect(ping.speed).toBe(45);
  });

  it('should throw error on invalid coordinates', () => {
    expect(() => LocationPing.create(95, 77.5946)).toThrow('Invalid latitude coordinate');
    expect(() => LocationPing.create(12.9716, 185)).toThrow('Invalid longitude coordinate');
  });

  it('should calculate distance in meters between two pings', () => {
    const ping1 = LocationPing.create(12.9716, 77.5946);
    const ping2 = LocationPing.create(12.976, 77.599);
    const distance = ping1.distanceToMeters(ping2);
    expect(distance).toBeGreaterThan(600);
    expect(distance).toBeLessThan(800);
  });
});

describe('Phase 18 — TrackingSession Aggregate', () => {
  it('should initialize active session', () => {
    const session = new TrackingSession({
      bookingId: 1,
      partnerId: 10,
      customerId: 100,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
    });

    expect(session.status).toBe('ACTIVE');
    expect(session.bookingId).toBe(1);
    expect(session.endedAt).toBeNull();
  });

  it('should update location ping and ETA', () => {
    const session = new TrackingSession({
      bookingId: 1,
      partnerId: 10,
      customerId: 100,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
    });

    const newPing = LocationPing.create(12.975, 77.598, 180, 50);
    session.updateLocation(newPing, 15);

    expect(session.currentLatitude).toBe(12.975);
    expect(session.currentLongitude).toBe(77.598);
    expect(session.etaMinutes).toBe(15);
  });

  it('should complete tracking session', () => {
    const session = new TrackingSession({
      bookingId: 1,
      partnerId: 10,
      customerId: 100,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
    });

    session.complete();
    expect(session.status).toBe('COMPLETED');
    expect(session.endedAt).toBeInstanceOf(Date);
  });
});
