import {
  StartTrackingSessionUseCase,
  TrackingSession,
  UpdateLiveGpsLocationUseCase,
  type ITrackingSessionRepository,
} from '@carbroz/domain-operations';
import {
  NotificationService,
  SendNotificationUseCase,
  type INotificationLogRepository,
} from '@carbroz/domain-communications';
import { beforeEach, describe, expect, it } from 'vitest';

import { MultiChannelNotificationProvider } from '@carbroz/platform-integrations';
import { FirebasePushProvider } from '../../../platform/integrations/src/communications/FirebasePushProvider.js';
import { Msg91SmsProvider } from '../../../platform/integrations/src/communications/Msg91SmsProvider.js';
import { ResendEmailProvider } from '../../../platform/integrations/src/communications/ResendEmailProvider.js';

describe('Phase 18 — Tracking & Notification Engine Use Cases', () => {
  const bookingId = 101;
  const customerId = 5;
  const partnerId = 20;
  const sessions = new Map<number, TrackingSession>();

  beforeEach(() => {
    sessions.clear();
  });

  const mockTrackingRepo: ITrackingSessionRepository = {
    async create(session) {
      session.id = 1;
      sessions.set(session.bookingId, session);
      return session;
    },
    async findById(id) {
      return Array.from(sessions.values()).find((session) => session.id === id) ?? null;
    },
    async findByPublicId(publicId) {
      return Array.from(sessions.values()).find((session) => session.publicId === publicId) ?? null;
    },
    async findByBookingId(id) {
      return sessions.get(id) ?? null;
    },
    async findActiveByPartnerId(id) {
      return Array.from(sessions.values()).find((session) => session.partnerId === id && session.status === 'ACTIVE') ?? null;
    },
    async update(session) {
      sessions.set(session.bookingId, session);
      return session;
    },
  };

  const mockNotificationLogRepo: INotificationLogRepository = {
    async create(log) { return log; },
    async findById() { return null; },
    async findByPublicId() { return null; },
    async listByRecipientId() { return []; },
    async listByBookingId() { return []; },
  };

  it('should start a tracking session with its initial location', async () => {
    const useCase = new StartTrackingSessionUseCase(mockTrackingRepo);

    const session = await useCase.execute({
      bookingId,
      partnerId,
      customerId,
      initialLatitude: 12.9716,
      initialLongitude: 77.5946,
    });

    expect(session.bookingId).toBe(bookingId);
    expect(session.status).toBe('ACTIVE');
    expect(session.currentLatitude).toBe(12.9716);
    expect(session.currentLongitude).toBe(77.5946);
  });

  it('should update live GPS location and the supplied ETA', async () => {
    const startUseCase = new StartTrackingSessionUseCase(mockTrackingRepo);
    const session = await startUseCase.execute({
      bookingId,
      partnerId,
      customerId,
      initialLatitude: 12.9716,
      initialLongitude: 77.5946,
    });

    expect(session.id).toBeDefined();

    const updateUseCase = new UpdateLiveGpsLocationUseCase(mockTrackingRepo);
    const updated = await updateUseCase.execute({
      sessionId: session.id!,
      latitude: 12.95,
      longitude: 77.6,
      etaMinutes: 12,
    });

    expect(updated.currentLatitude).toBe(12.95);
    expect(updated.currentLongitude).toBe(77.6);
    expect(updated.etaMinutes).toBe(12);
  });

  it('should dispatch multi-channel push, sms and email notifications', async () => {
    const pushProvider = new FirebasePushProvider();
    const smsProvider = new Msg91SmsProvider();
    const emailProvider = new ResendEmailProvider();
    const multiProvider = new MultiChannelNotificationProvider(pushProvider, smsProvider, emailProvider);

    const service = new NotificationService(mockNotificationLogRepo, multiProvider);
    const useCase = new SendNotificationUseCase(service);

    const pushLog = await useCase.execute({
      bookingId,
      recipientId: customerId,
      channel: 'PUSH',
      recipient: 'fcm_token_123',
      templateId: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      body: 'Your service partner is assigned.',
      data: { bookingId },
    });
    expect(pushLog.status).toBe('SENT');

    const smsLog = await useCase.execute({
      bookingId,
      recipientId: customerId,
      channel: 'SMS',
      recipient: '+919876543210',
      templateId: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      body: 'Your booking #101 is confirmed.',
      data: {},
    });
    expect(smsLog.status).toBe('SENT');

    const emailLog = await useCase.execute({
      bookingId,
      recipientId: customerId,
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
