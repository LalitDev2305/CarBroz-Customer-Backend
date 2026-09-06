import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import type { UserSession } from '../../domain/UserSession.js';
import { PrismaUserSessionRepository } from './PrismaUserSessionRepository.js';

const sessionRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 11,
  publicId: 'session_11',
  userId: 7,
  deviceId: 'device-1',
  deviceModel: 'Pixel',
  osVersion: '16',
  fcmToken: 'fcm-1',
  refreshToken: 'refresh-1',
  isRevoked: false,
  lastActiveAt: new Date('2026-09-06T00:00:00.000Z'),
  createdAt: new Date('2026-09-01T00:00:00.000Z'),
  updatedAt: new Date('2026-09-06T00:00:00.000Z'),
  deletedAt: null,
  user: { id: 7, publicId: 'user_7' },
  ...overrides,
});

function fixture() {
  const userSession = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    updateMany: vi.fn(),
  };
  const prisma = { userSession } as unknown as PrismaClient;
  return { repository: new PrismaUserSessionRepository(prisma), userSession };
}

describe('PrismaUserSessionRepository', () => {
  it('maps id reads and missing sessions', async () => {
    const { repository, userSession } = fixture();
    userSession.findUnique.mockResolvedValueOnce(sessionRecord()).mockResolvedValueOnce(null);

    await expect(repository.findById(11)).resolves.toMatchObject({ id: 11, userId: 7, user: { id: 7 } });
    await expect(repository.findById(999)).resolves.toBeNull();
  });

  it('maps all active sessions', async () => {
    const { repository, userSession } = fixture();
    userSession.findMany.mockResolvedValue([sessionRecord(), sessionRecord({ id: 12, publicId: 'session_12' })]);

    await expect(repository.findAll()).resolves.toHaveLength(2);
    expect(userSession.findMany).toHaveBeenCalledWith({ where: { deletedAt: null }, include: { user: true } });
  });

  it('creates and updates sessions through explicit persistence fields', async () => {
    const { repository, userSession } = fixture();
    userSession.create.mockResolvedValue(sessionRecord());
    userSession.update.mockResolvedValue(sessionRecord({ deviceModel: 'Pixel Pro', isRevoked: true }));

    await expect(repository.create({ userId: 7, deviceId: 'device-1', refreshToken: 'refresh-1' })).resolves.toMatchObject({ id: 11 });
    expect(userSession.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 7, deviceId: 'device-1', refreshToken: 'refresh-1' }),
    }));

    await expect(repository.update(11, { deviceModel: 'Pixel Pro', isRevoked: true })).resolves.toMatchObject({ deviceModel: 'Pixel Pro', isRevoked: true });
    expect(userSession.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 11 } }));
  });

  it('save updates persisted sessions and creates new sessions', async () => {
    const { repository, userSession } = fixture();
    userSession.update.mockResolvedValue(sessionRecord());
    userSession.create.mockResolvedValue(sessionRecord({ id: 12 }));

    await repository.save({ id: 11, userId: 7, deviceId: 'device-1' } as UserSession);
    expect(userSession.update).toHaveBeenCalled();

    await repository.save({ userId: 7, deviceId: 'device-2' } as UserSession);
    expect(userSession.create).toHaveBeenCalled();
  });

  it('soft deletes successfully and reports persistence failure', async () => {
    const { repository, userSession } = fixture();
    userSession.update.mockResolvedValueOnce(sessionRecord({ deletedAt: new Date() })).mockRejectedValueOnce(new Error('missing'));

    await expect(repository.delete(11)).resolves.toBe(true);
    await expect(repository.delete(999)).resolves.toBe(false);
  });

  it('rejects missing and soft-deleted device sessions while mapping an active one', async () => {
    const { repository, userSession } = fixture();
    userSession.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(sessionRecord({ deletedAt: new Date('2026-09-06T00:00:00.000Z') }))
      .mockResolvedValueOnce(sessionRecord());

    await expect(repository.findByDevice(7, 'missing')).resolves.toBeNull();
    await expect(repository.findByDevice(7, 'deleted')).resolves.toBeNull();
    await expect(repository.findByDevice(7, 'device-1')).resolves.toMatchObject({ deviceId: 'device-1' });
  });

  it('maps refresh-token sessions and their not-found variant', async () => {
    const { repository, userSession } = fixture();
    userSession.findFirst.mockResolvedValueOnce(sessionRecord()).mockResolvedValueOnce(null);

    await expect(repository.findByRefreshToken('refresh-1', 'device-1')).resolves.toMatchObject({ refreshToken: 'refresh-1' });
    await expect(repository.findByRefreshToken('missing', 'device-1')).resolves.toBeNull();
  });

  it('upserts an active device session and maps the result', async () => {
    const { repository, userSession } = fixture();
    userSession.upsert.mockResolvedValue(sessionRecord({ refreshToken: 'refresh-2' }));

    await expect(repository.upsert(7, 'device-1', {
      deviceModel: 'Pixel', osVersion: '16', fcmToken: 'fcm-1', refreshToken: 'refresh-2',
    })).resolves.toMatchObject({ refreshToken: 'refresh-2', isRevoked: false });
    expect(userSession.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_deviceId: { userId: 7, deviceId: 'device-1' } },
      update: expect.objectContaining({ isRevoked: false, refreshToken: 'refresh-2' }),
      create: expect.objectContaining({ userId: 7, deviceId: 'device-1', refreshToken: 'refresh-2' }),
    }));
  });

  it('revokes all user sessions without deleting them', async () => {
    const { repository, userSession } = fixture();
    userSession.updateMany.mockResolvedValue({ count: 2 });

    await repository.revokeAllForUser(7);

    expect(userSession.updateMany).toHaveBeenCalledWith({
      where: { userId: 7 },
      data: { isRevoked: true, refreshToken: null },
    });
  });
});
