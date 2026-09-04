import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnregisterDeviceTokenUseCase } from '../application/UnregisterDeviceTokenUseCase.js';
import { ListNotificationsUseCase } from '../application/ListNotificationsUseCase.js';
import { MarkNotificationReadUseCase } from '../application/MarkNotificationReadUseCase.js';

describe('Communications application use cases', () => {
  const mockTokenRepo = {
    findByToken: vi.fn(),
    upsert: vi.fn(),
    listActiveByUserId: vi.fn(),
    deactivate: vi.fn(),
  } as any;

  const mockLogRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByPublicId: vi.fn(),
    listByRecipientId: vi.fn(),
    listByBookingId: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('UnregisterDeviceTokenUseCase deactivates the requested device through the repository port', async () => {
    mockTokenRepo.deactivate.mockResolvedValue(undefined);
    const useCase = new UnregisterDeviceTokenUseCase(mockTokenRepo);

    await useCase.execute({ userId: 12, deviceId: 'DEVICE_001' });

    expect(mockTokenRepo.deactivate).toHaveBeenCalledTimes(1);
    expect(mockTokenRepo.deactivate).toHaveBeenCalledWith(12, 'DEVICE_001');
  });

  it('UnregisterDeviceTokenUseCase propagates repository failures without retrying implicitly', async () => {
    const failure = new Error('repository unavailable');
    mockTokenRepo.deactivate.mockRejectedValue(failure);
    const useCase = new UnregisterDeviceTokenUseCase(mockTokenRepo);

    await expect(useCase.execute({ userId: 12, deviceId: 'DEVICE_001' })).rejects.toBe(failure);
    expect(mockTokenRepo.deactivate).toHaveBeenCalledTimes(1);
  });

  it('ListNotificationsUseCase returns recipient notifications from the repository port', async () => {
    const notifications = [
      { id: 10, recipientId: 12, channel: 'PUSH', status: 'SENT', createdAt: new Date() },
    ];
    mockLogRepo.listByRecipientId.mockResolvedValue(notifications);
    const useCase = new ListNotificationsUseCase(mockLogRepo);

    const result = await useCase.execute(12);

    expect(result).toBe(notifications);
    expect(mockLogRepo.listByRecipientId).toHaveBeenCalledWith(12);
  });

  it('ListNotificationsUseCase returns an empty list when the recipient has no history', async () => {
    mockLogRepo.listByRecipientId.mockResolvedValue([]);
    const useCase = new ListNotificationsUseCase(mockLogRepo);

    await expect(useCase.execute(99)).resolves.toEqual([]);
  });

  it('MarkNotificationReadUseCase marks an existing notification READ', async () => {
    const notification = { id: 10, recipientId: 12, channel: 'PUSH', status: 'SENT', createdAt: new Date() };
    mockLogRepo.findById.mockResolvedValue(notification);
    const useCase = new MarkNotificationReadUseCase(mockLogRepo);

    const result = await useCase.execute(10);

    expect(result.status).toBe('READ');
    expect(mockLogRepo.findById).toHaveBeenCalledWith(10);
  });

  it('MarkNotificationReadUseCase rejects an unknown notification id', async () => {
    mockLogRepo.findById.mockResolvedValue(null);
    const useCase = new MarkNotificationReadUseCase(mockLogRepo);

    await expect(useCase.execute(404)).rejects.toThrow('Notification log with ID 404 not found');
  });
});
