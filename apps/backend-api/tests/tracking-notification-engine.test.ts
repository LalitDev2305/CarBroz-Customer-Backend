import { beforeEach, describe, expect, it } from 'vitest';
import {
  Booking,
  LocationPing,
  NotificationLog,
  NotificationService,
  TrackingSession,
} from '@carbroz/common';
import type {
  IBookingRepository,
  IDeviceTokenRepository,
  IMapsProvider,
  INotificationLogRepository,
  ITrackingSessionRepository,
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
  const sessions = new Map<number, TrackingSession>();
  let mapsApiCallCount = 0;

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
      return (publicId === '80000000-0000-0000-0000-000000000101' || publicId === dummyBooking.publicId) ? dummyBooking : null;
    },
    async create(b) { return b; },
    async update(b) { return b; },
    async listByCustomerId() { return []; },
    async listByPartnerId() { return []; },
    async listAll() { return []; },
    async findConflictingPartnerBooking() { return null; },
    async findConflictingSlotBooking() { return null; },
    async findExpiredPendingBookings() { return []; },
  };

  const mockTrackingRepo: ITrackingSessionRepository = {
    async create(session) {
      session.id = 1;
      sessions.set(session.bookingId, session);
      return session;
    },
    async findByBookingId(bookingId) {
      return sessions.get(bookingId) ?? null;
    },
    async update(session) {
      sessions.set(session.bookingId, session);
      return session;
    },
  };

  const mockMapsProvider: IMapsProvider = {
    async calculateRoute(originLat, originLng, destLat, destLng) {
      mapsApiCallCount++;
      return {
        distanceMeters: 5000,
        durationSeconds: 900,
        polyline: 'sample_polyline',
      };
    },
    async geocode() { throw new Error('Not implemented'); },
    async reverseGeocode() { throw new Error('Not implemented'); },
  };

  const mockDeviceTokenRepo: IDeviceTokenRepository = {
    async upsert(token) { return token; },
    async findByUserId() { return []; },
    async delete() { return; },
  };

  const mockNotificationLogRepo: INotificationLogRepository = {
    async create(log) { return log; },
    async listByRecipientId() { return []; },
  };

  it('should start tracking session and compute initial ETA', async () => {
    const useCase = new StartTrackingSessionUseCase(mockBookingRepo, mockTrackingRepo);

    const session = await useCase.execute({
      bookingPublicId: dummyBooking.publicId!,
      partnerUserId: 20,
      latitude: 12.9716,
      longitude: 77.5946,
    });

    expect(session.bookingId).toBe(101);
    expect(session.status).toBe('ACTIVE');
  });

  it('should update location ping and recalculate ETA', async () => {
    const startUseCase = new StartTrackingSessionUseCase(mockBookingRepo, mockTrackingRepo);
    await startUseCase.execute({
      bookingPublicId: dummyBooking.publicId!,
      partnerUserId: 20,
      latitude: 12.9716,
      longitude: 77.5946,
    });

    const updateUseCase = new UpdateLocationPingUseCase(mockTrackingRepo, mockBookingRepo, mockMapsProvider);
    const updated = await updateUseCase.execute({
      bookingPublicId: dummyBooking.publicId!,
      partnerUserId: 20,
      latitude: 12.9500,
      longitude: 77.6000,
    });

    expect(updated.currentLatitude).toBe(12.9500);
  });

  it('should dispatch multi-channel push, sms and email notifications', async () => {
    const pushProvider = new FirebasePushProvider();
    const smsProvider = new Msg91SmsProvider('mock_key', 'CARBRZ');
    const emailProvider = new ResendEmailProvider('mock_key');
    const multiProvider = new MultiChannelNotificationProvider(pushProvider, smsProvider, emailProvider);

    const service = new NotificationService(mockNotificationLogRepo, multiProvider);
    const useCase = new SendNotificationUseCase(service);

    const pushLog = await useCase.execute({
      bookingId: 101,
      recipientId: 5,
      channel: 'PUSH',
      recipient: 'fcm_token_123',
      templateId: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      body: 'Your service partner is assigned.',
      data: { bookingId: 101 },
    });
    expect(pushLog.status).toBe('SENT');

    const smsLog = await useCase.execute({
      bookingId: 101,
      recipientId: 5,
      channel: 'SMS',
      recipient: '+919876543210',
      templateId: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      body: 'Your booking #101 is confirmed.',
      data: {},
    });
    expect(smsLog.status).toBe('SENT');

    const emailLog = await useCase.execute({
      bookingId: 101,
      recipientId: 5,
      channel: 'EMAIL',
      recipient: 'customer@carbroz.com',
      templateId: 'BOOKING_CONFIRMED',
      title: 'Booking Invoice',
      body: 'Here is your invoice for booking #101.',
      data: {},
    });
    expect(emailLog.status).toBe('SENT');
  });
});
