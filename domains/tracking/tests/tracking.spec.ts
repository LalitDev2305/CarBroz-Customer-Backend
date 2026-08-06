import { describe, it, expect, vi } from 'vitest';
import { TrackingSession } from '../domain/TrackingSession.js';
import { LocationPing } from '../domain/LocationPing.js';
import { StartTrackingSessionUseCase } from '../application/StartTrackingSessionUseCase.js';
import { UpdateLiveGpsLocationUseCase } from '../application/UpdateLiveGpsLocationUseCase.js';
import { GetLiveTrackingTimelineUseCase } from '../application/GetLiveTrackingTimelineUseCase.js';
import { CompleteTrackingSessionUseCase } from '../application/CompleteTrackingSessionUseCase.js';
import { CancelTrackingSessionUseCase } from '../application/CancelTrackingSessionUseCase.js';
import { SyncOfflineGpsLocationsUseCase } from '../application/SyncOfflineGpsLocationsUseCase.js';

describe('Tracking Domain Model & Use Cases', () => {
  it('LocationPing should validate latitude and longitude boundaries', () => {
    const validPing = new LocationPing({ latitude: 12.9716, longitude: 77.5946 });
    expect(validPing.latitude).toBe(12.9716);

    expect(() => new LocationPing({ latitude: 95, longitude: 77 })).toThrow('Invalid latitude');
    expect(() => new LocationPing({ latitude: 12, longitude: 190 })).toThrow('Invalid longitude');
  });

  it('TrackingSession domain model state transitions', () => {
    const session = new TrackingSession({
      id: 1,
      bookingId: 100,
      partnerId: 5,
      customerId: 12,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
    });

    expect(session.status).toBe('ACTIVE');
    expect(session.currentLocationPing.latitude).toBe(12.9716);

    const ping = new LocationPing({ latitude: 12.9800, longitude: 77.6000, heading: 90, speed: 45 });
    session.updateLocation(ping, 10);
    expect(session.currentLatitude).toBe(12.9800);
    expect(session.etaMinutes).toBe(10);

    session.complete();
    expect(session.status).toBe('COMPLETED');
    expect(session.endedAt).toBeDefined();

    expect(() => session.updateLocation(ping)).toThrow('Cannot update location for non-active tracking session');

    const sessionToCancel = new TrackingSession({
      bookingId: 101,
      partnerId: 5,
      customerId: 12,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
    });
    sessionToCancel.cancel();
    expect(sessionToCancel.status).toBe('CANCELLED');
  });

  const mockSession = new TrackingSession({
    id: 1,
    bookingId: 100,
    partnerId: 5,
    customerId: 12,
    currentLatitude: 12.9716,
    currentLongitude: 77.5946,
  });

  const mockRepository = {
    findByBookingId: vi.fn().mockImplementation(async (id) => (id === 100 ? mockSession : null)),
    findById: vi.fn().mockImplementation(async (id) => (id === 1 ? mockSession : null)),
    create: vi.fn().mockImplementation(async (s) => ({ ...s, id: 1 })),
    update: vi.fn().mockImplementation(async (s) => s),
  } as any;

  it('StartTrackingSessionUseCase should start tracking session', async () => {
    const useCase = new StartTrackingSessionUseCase(mockRepository);
    const result = await useCase.execute({
      bookingId: 100,
      partnerId: 5,
      customerId: 12,
      initialLatitude: 12.9716,
      initialLongitude: 77.5946,
    });

    expect(result.bookingId).toBe(100);
    expect(result.status).toBe('ACTIVE');
  });

  it('UpdateLiveGpsLocationUseCase should update live GPS coordinates', async () => {
    const useCase = new UpdateLiveGpsLocationUseCase(mockRepository);
    const result = await useCase.execute({
      sessionId: 1,
      latitude: 12.9800,
      longitude: 77.6000,
      heading: 180,
      speed: 50,
      etaMinutes: 10,
    });

    expect(result.id).toBe(1);
  });

  it('GetLiveTrackingTimelineUseCase should return active session for booking', async () => {
    const useCase = new GetLiveTrackingTimelineUseCase(mockRepository);
    const result = await useCase.execute(100);

    expect(result).toBeDefined();
    expect(result?.bookingId).toBe(100);
  });

  it('CompleteTrackingSessionUseCase should mark tracking session as completed', async () => {
    const useCase = new CompleteTrackingSessionUseCase(mockRepository);
    const result = await useCase.execute(1);

    expect(result.status).toBe('COMPLETED');
  });

  it('CancelTrackingSessionUseCase should mark tracking session as cancelled', async () => {
    const activeSession = new TrackingSession({
      id: 2,
      bookingId: 200,
      partnerId: 5,
      customerId: 12,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
    });
    const customRepo = {
      findById: vi.fn().mockImplementation(async () => activeSession),
      update: vi.fn().mockImplementation(async (s) => s),
    } as any;

    const useCase = new CancelTrackingSessionUseCase(customRepo);
    const result = await useCase.execute(2);

    expect(result.status).toBe('CANCELLED');
  });

  it('SyncOfflineGpsLocationsUseCase should sync batch of offline GPS pings', async () => {
    const activeSession = new TrackingSession({
      id: 3,
      bookingId: 300,
      partnerId: 5,
      customerId: 12,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
    });
    const customRepo = {
      findById: vi.fn().mockImplementation(async () => activeSession),
      update: vi.fn().mockImplementation(async (s) => s),
    } as any;

    const useCase = new SyncOfflineGpsLocationsUseCase(customRepo);
    const result = await useCase.execute({
      sessionId: 3,
      pings: [
        { latitude: 12.9000, longitude: 77.5000, timestamp: '2026-08-06T03:00:00Z' },
        { latitude: 12.9100, longitude: 77.5100, timestamp: '2026-08-06T03:05:00Z' },
      ],
    });

    expect(result.id).toBe(3);
    expect(result.currentLatitude).toBe(12.9100);
  });
});
