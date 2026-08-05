import { describe, expect, it } from 'vitest';
import {
  Booking,
  IBookingRepository,
  IDeviceTokenRepository,
  IMapsProvider,
  INotificationLogRepository,
  ITrackingSessionRepository,
  LocationPing,
  NotificationLog,
  NotificationService,
  TrackingSession,
} from '@carbroz/common';
import { StartTrackingSessionUseCase } from '../src/modules/tracking/use-cases/StartTrackingSessionUseCase.js';
import { UpdateLocationPingUseCase } from '../src/modules/tracking/use-cases/UpdateLocationPingUseCase.js';
import { GetCurrentTrackingUseCase } from '../src/modules/tracking/use-cases/GetCurrentTrackingUseCase.js';
import { RegisterDeviceTokenUseCase } from '../src/modules/notification/use-cases/RegisterDeviceTokenUseCase.js';
import { SendNotificationUseCase } from '../src/modules/notification/use-cases/SendNotificationUseCase.js';
import { FirebasePushProvider } from '../src/providers/notification/FirebasePushProvider.js';
import { Msg91SmsProvider } from '../src/providers/notification/Msg91SmsProvider.js';
import { ResendEmailProvider } from '../src/providers/notification/ResendEmailProvider.js';
import { MultiChannelNotificationProvider } from '../src/providers/notification/MultiChannelNotificationProvider.js';

describe('Phase 18 — Tracking & Notification Engine Use Cases', () => {
  beforeEach(() => {
    sessions.clear();
    mapsApiCallCount = 0;
  });

  const dummyBooking = new Booking({
    id: 101,
    publicId: '80000000-0000-0000-0000-000000000101',
    customerId: 5,
    partnerId: 20,
    vehicleId: 1,
    addressId: 1,
    serviceId: 1,
    status: 'CONFIRMED',
    slotStartTime: new Date(),
    slotEndTime: new Date(Date.now() + 3600000),
    totalPricePaise: 150000,
    snapshots: {
      address: {
        id: 1,
        fullAddress: 'Koramangala, Bangalore',
        latitude: 12.9352,
        longitude: 77.6245,
      },
    },
  });

  const mockBookingRepo: IBookingRepository = {
    async findById(id) {
      return id === 101 ? dummyBooking : null;
    },
    async findByPublicId(publicId) {
      return publicId === dummyBooking.publicId ? dummyBooking : null;
    },
    async create(b) {
      return b;
    },
    async update(b) {
      return b;
    },
    async findPendingExpired() {
      return [];
    },
    async hasOverlappingBooking() {
      return false;
    },
  };

  const sessions = new Map<number, TrackingSession>();
  const mockTrackingRepo: ITrackingSessionRepository = {
    async create(session) {
      session.id = 1;
      session.createdAt = new Date();
      session.updatedAt = new Date();
      sessions.set(session.bookingId, session);
      return session;
    },
    async findById(id) {
      return Array.from(sessions.values()).find((s) => s.id === id) || null;
    },
    async findByPublicId(publicId) {
      return Array.from(sessions.values()).find((s) => s.publicId === publicId) || null;
    },
    async findByBookingId(bookingId) {
      return sessions.get(bookingId) || null;
    },
    async findActiveByPartnerId(partnerId) {
      return Array.from(sessions.values()).find((s) => s.partnerId === partnerId && s.status === 'ACTIVE') || null;
    },
    async update(session) {
      session.updatedAt = new Date();
      sessions.set(session.bookingId, session);
      return session;
    },
  };

  let mapsApiCallCount = 0;
  const mockMapsProvider: IMapsProvider = {
    async geocode() {
      return { coordinates: { latitude: 0, longitude: 0 }, address: {} };
    },
    async reverseGeocode() {
      return { coordinates: { latitude: 0, longitude: 0 }, address: {} };
    },
    async calculateDistance() {
      mapsApiCallCount++;
      return { distanceInMeters: 5000, durationInSeconds: 720 };
    },
  };

  it('should start tracking session and calculate initial ping', async () => {
    const startUseCase = new StartTrackingSessionUseCase(mockBookingRepo, mockTrackingRepo);
    const session = await startUseCase.execute({
      bookingPublicId: dummyBooking.publicId,
      partnerUserId: 20,
      latitude: 12.9716,
      longitude: 77.5946,
    });

    expect(session.status).toBe('ACTIVE');
    expect(session.bookingId).toBe(101);
  });

  it('should update location ping and throttle ETA calculations', async () => {
    const startUseCase = new StartTrackingSessionUseCase(mockBookingRepo, mockTrackingRepo);
    await startUseCase.execute({
      bookingPublicId: dummyBooking.publicId,
      partnerUserId: 20,
      latitude: 12.9716,
      longitude: 77.5946,
    });

    const updateUseCase = new UpdateLocationPingUseCase(mockTrackingRepo, mockBookingRepo, mockMapsProvider);

    // First ping (initial ETA calculation since session.etaMinutes is null): maps API is called once
    mapsApiCallCount = 0;
    const session1 = await updateUseCase.execute({
      bookingPublicId: dummyBooking.publicId,
      latitude: 12.9717,
      longitude: 77.5947,
    });

    expect(session1.currentLatitude).toBe(12.9717);
    expect(mapsApiCallCount).toBe(1);

    // Second ping (moved only ~15m < 500m): maps API should be THROTTLED (call count stays 1)
    const session2 = await updateUseCase.execute({
      bookingPublicId: dummyBooking.publicId,
      latitude: 12.9718,
      longitude: 77.5948,
    });

    expect(session2.currentLatitude).toBe(12.9718);
    expect(mapsApiCallCount).toBe(1);

    // Third ping (moved > 500m): maps API should be called again (call count becomes 2)
    const session3 = await updateUseCase.execute({
      bookingPublicId: dummyBooking.publicId,
      latitude: 12.9800,
      longitude: 77.6000,
    });

    expect(session3.currentLatitude).toBe(12.98);
    expect(mapsApiCallCount).toBe(2);
    expect(session3.etaMinutes).toBe(12);
  });

  it('should register device token and dispatch multi-channel notification', async () => {
    const mockDeviceTokens: any[] = [];
    const mockDeviceRepo: IDeviceTokenRepository = {
      async upsert(t) {
        mockDeviceTokens.push(t);
        return t;
      },
      async findByToken() {
        return null;
      },
      async listActiveByUserId() {
        return [];
      },
      async deactivate() {},
    };

    const registerUseCase = new RegisterDeviceTokenUseCase(mockDeviceRepo);
    const deviceToken = await registerUseCase.execute({
      userId: 5,
      deviceId: 'iphone_12',
      platform: 'IOS',
      token: 'fcm_token_12345',
    });

    expect(deviceToken.token).toBe('fcm_token_12345');

    const mockLogRepo: INotificationLogRepository = {
      async create(l) {
        return l;
      },
      async findById() {
        return null;
      },
      async findByPublicId() {
        return null;
      },
      async listByRecipientId() {
        return [];
      },
      async listByBookingId() {
        return [];
      },
    };

    const push = new FirebasePushProvider();
    const sms = new Msg91SmsProvider();
    const email = new ResendEmailProvider();
    const multiChannelProvider = new MultiChannelNotificationProvider(push, sms, email);
    const notificationService = new NotificationService(mockLogRepo, multiChannelProvider);

    const sendUseCase = new SendNotificationUseCase(notificationService);
    const log = await sendUseCase.execute({
      channel: 'SMS',
      templateId: 'PARTNER_EN_ROUTE',
      recipient: '+919876543210',
      recipientId: 5,
      body: 'Partner is on the way!',
    });

    expect(log.status).toBe('SENT');
    expect(log.provider).toBe('MSG91');
  });
});
