import { describe, expect, it } from 'vitest';
import {
  DeviceToken,
  INotificationLogRepository,
  INotificationProvider,
  NotificationLog,
  NotificationPayload,
  NotificationService,
} from '../../src/index.js';

describe('Phase 18 — DeviceToken Entity', () => {
  it('should create and deactivate device token', () => {
    const token = new DeviceToken({
      userId: 5,
      deviceId: 'dev_123',
      platform: 'ANDROID',
      token: 'fcm_token_abc',
    });

    expect(token.isActive).toBe(true);
    token.deactivate();
    expect(token.isActive).toBe(false);
  });
});

describe('Phase 18 — NotificationService Domain Service', () => {
  it('should orchestrate dispatch and record audit log', async () => {
    const mockLogs: NotificationLog[] = [];
    const mockRepo: INotificationLogRepository = {
      async create(log: NotificationLog) {
        mockLogs.push(log);
        return log;
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

    const mockProvider: INotificationProvider = {
      async dispatch() {
        return {
          success: true,
          provider: 'MOCK_PROVIDER',
          providerReference: 'ref_999',
        };
      },
    };

    const service = new NotificationService(mockRepo, mockProvider);
    const payload = new NotificationPayload({
      channel: 'SMS',
      templateId: 'OTP_VERIFY',
      recipient: '+919999999999',
      recipientId: 42,
      body: 'Your OTP is 123456',
    });

    const result = await service.send(payload);

    expect(result.status).toBe('SENT');
    expect(result.provider).toBe('MOCK_PROVIDER');
    expect(result.providerReference).toBe('ref_999');
    expect(mockLogs.length).toBe(1);
  });
});
