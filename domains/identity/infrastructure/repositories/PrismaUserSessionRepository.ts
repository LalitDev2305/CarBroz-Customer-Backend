import type { PrismaClient } from '@prisma/client';
import type { UserSession } from '../../domain/UserSession.js';
import type { IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository.js';

/** Prisma adapter for Identity-owned device sessions. Refresh-token state lives in its dedicated repository. */
export class PrismaUserSessionRepository implements IUserSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findUnique({
      where: { id, deletedAt: null },
      include: { user: true },
    });
    return session ? this.mapToDomain(session) : null;
  }

  async findAll(): Promise<UserSession[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: { deletedAt: null },
      include: { user: true },
    });
    return sessions.map((session) => this.mapToDomain(session));
  }

  async create(data: Partial<UserSession>): Promise<UserSession> {
    const session = await this.prisma.userSession.create({
      data: {
        userId: data.userId!,
        deviceId: data.deviceId!,
        deviceModel: data.deviceModel,
        osVersion: data.osVersion,
        fcmToken: data.fcmToken,
        isRevoked: data.isRevoked ?? false,
        lastActiveAt: data.lastActiveAt ?? new Date(),
      },
      include: { user: true },
    });
    return this.mapToDomain(session);
  }

  async update(id: number, data: Partial<UserSession>): Promise<UserSession> {
    const session = await this.prisma.userSession.update({
      where: { id },
      data: {
        deviceModel: data.deviceModel,
        osVersion: data.osVersion,
        fcmToken: data.fcmToken,
        isRevoked: data.isRevoked,
        lastActiveAt: data.lastActiveAt,
      },
      include: { user: true },
    });
    return this.mapToDomain(session);
  }

  async save(entity: UserSession): Promise<UserSession> {
    if (entity.id) return this.update(entity.id, entity);
    return this.create(entity);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.userSession.update({
        where: { id },
        data: { deletedAt: new Date(), isRevoked: true },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findByDevice(userId: number, deviceId: string): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findUnique({
      where: { userId_deviceId: { userId, deviceId } },
      include: { user: true },
    });
    if (!session || session.deletedAt) return null;
    return this.mapToDomain(session);
  }

  async upsert(userId: number, deviceId: string, data: Partial<UserSession>): Promise<UserSession> {
    const lastActiveAt = data.lastActiveAt ?? new Date();
    const session = await this.prisma.userSession.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      update: {
        deviceModel: data.deviceModel,
        osVersion: data.osVersion,
        fcmToken: data.fcmToken,
        lastActiveAt,
        isRevoked: false,
        deletedAt: null,
      },
      create: {
        userId,
        deviceId,
        deviceModel: data.deviceModel,
        osVersion: data.osVersion,
        fcmToken: data.fcmToken,
        lastActiveAt,
      },
      include: { user: true },
    });
    return this.mapToDomain(session);
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  private mapToDomain(session: any): UserSession {
    return {
      id: session.id,
      publicId: session.publicId,
      userId: session.userId,
      deviceId: session.deviceId,
      deviceModel: session.deviceModel,
      osVersion: session.osVersion,
      fcmToken: session.fcmToken,
      isRevoked: session.isRevoked,
      lastActiveAt: session.lastActiveAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      deletedAt: session.deletedAt,
      user: session.user,
    };
  }
}
