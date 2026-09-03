import { describe, it, expect, vi } from 'vitest';
import { RegisterDeviceTokenUseCase } from '../application/RegisterDeviceTokenUseCase.js';
import { UnregisterDeviceTokenUseCase } from '../application/UnregisterDeviceTokenUseCase.js';
import { SendMultiChannelNotificationUseCase } from '../application/SendMultiChannelNotificationUseCase.js';
import { ListNotificationsUseCase } from '../application/ListNotificationsUseCase.js';
import { MarkNotificationReadUseCase } from '../application/MarkNotificationReadUseCase.js';

describe('Notification Domain Use Cases', () => {
  const mockTokenRepo = {
    findByToken: vi.fn().mockImplementation(async () => null),
    upsert: vi.fn().mockImplementation(async (tokenData) => ({ id: 1, ...tokenData })),
    deactivate: vi.fn().mockImplementation(async () => undefined),
  } as any;

  const mockLogRepo = {
    create: vi.fn().mockImplementation(async (logData) => ({ id: 10, ...logData, createdAt: new Date() })),
    listByRecipientId: vi.fn().mockImplementation(async (recipientId) => [
      { id: 10, recipientId, channel: 'PUSH', title: 'Test Alert', body: 'Test Body', status: 'SENT', createdAt: new Date() },
    ]),
    findById: vi.fn().mockImplementation(async (id) => ({ id, recipientId: 12, channel: 'PUSH', title: 'Test Alert', body: 'Test Body', status: 'SENT', createdAt: new Date() })),
  } as any;

  it('RegisterDeviceTokenUseCase should register a new FCM device token', async () => {
    const useCase = new RegisterDeviceTokenUseCase(mockTokenRepo);
    const result = await useCase.execute({
      userId: 12,
      deviceId: 'DEVICE_001',
      token: 'fcm_token_xyz_123',
      platform: 'ANDROID',
    });

    expect(result.userId).toBe(12);
    expect(result.token).toBe('fcm_token_xyz_123');
    expect(result.isActive).toBe(true);
  });

  it('UnregisterDeviceTokenUseCase should deactivate FCM device token', async () => {
    const useCase = new UnregisterDeviceTokenUseCase(mockTokenRepo);
    await useCase.execute({
      userId: 12,
      deviceId: 'DEVICE_001',
    });

    expect(mockTokenRepo.deactivate).toHaveBeenCalledWith(12, 'DEVICE_001');
  });

  it('SendMultiChannelNotificationUseCase should log multi-channel notification dispatch', async () => {
    const useCase = new SendMultiChannelNotificationUseCase(mockLogRepo);
    const result = await useCase.execute({
      userId: 12,
      recipient: '+919999999999',
      channel: 'PUSH',
      templateId: 'JOB_STAGE_UPDATE',
      title: 'Partner Arriving',
      body: 'Your driver is 5 mins away.',
    });

    expect(result.recipientId).toBe(12);
    expect(result.channel).toBe('PUSH');
    expect(result.status).toBe('SENT');
  });

  it('ListNotificationsUseCase should return notifications for user', async () => {
    const useCase = new ListNotificationsUseCase(mockLogRepo);
    const results = await useCase.execute(12);

    expect(results.length).toBe(1);
    expect(results[0]?.recipientId).toBe(12);
  });

  it('MarkNotificationReadUseCase should update status to READ', async () => {
    const useCase = new MarkNotificationReadUseCase(mockLogRepo);
    const result = await useCase.execute(10);

    expect(result.status).toBe('READ');
  });
});
