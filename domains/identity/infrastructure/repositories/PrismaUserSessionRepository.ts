import { type UserSession } from '../../domain/UserSession.js';
import { type IUserSessionRepository } from '../../domain/repositories/IUserSessionRepository.js';
import { PrismaProvider } from '@carbroz/platform-database';

export class PrismaUserSessionRepository implements IUserSessionRepository {
  private readonly prisma;
  constructor(prismaProvider: PrismaProvider) {
    this.prisma = prismaProvider.getClient();
  }

  async findById(id: number): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findUnique({
      where: { id, deletedAt: null },
      include: { user: true }
    });
    return session ? this.mapToDomain(session) : null;
  }

  async findAll(): Promise<UserSession[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: { deletedAt: null },
      include: { user: true }
    });
    return sessions.map(this.mapToDomain);
  }

  async create(data: Partial<UserSession>): Promise<UserSession> {
    const session = await this.prisma.userSession.create({
      data: {
        userId: data.userId!,
        deviceId: data.deviceId!,
        deviceModel: data.deviceModel ?? null,
        osVersion: data.osVersion ?? null,
        fcmToken: data.fcmToken ?? null,
        refreshToken: data.refreshToken ?? null,
      },
      include: { user: true }
    });
    return this.mapToDomain(session);
  }

  async update(id: number, data: Partial<UserSession>): Promise<UserSession> {
    const session = await this.prisma.userSession.update({
      where: { id },
      data: {
        ...(data.deviceModel !== undefined ? { deviceModel: data.deviceModel } : {}),
        ...(data.osVersion !== undefined ? { osVersion: data.osVersion } : {}),
        ...(data.fcmToken !== undefined ? { fcmToken: data.fcmToken } : {}),
        ...(data.refreshToken !== undefined ? { refreshToken: data.refreshToken } : {}),
        ...(data.isRevoked !== undefined ? { isRevoked: data.isRevoked } : {}),
        ...(data.lastActiveAt !== undefined ? { lastActiveAt: data.lastActiveAt } : {}),
      },
      include: { user: true }
    });
    return this.mapToDomain(session);
  }

  async save(entity: UserSession): Promise<UserSession> {
    if (entity.id) {
      return this.update(entity.id, entity);
    }
    return this.create(entity);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.userSession.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return true;
    } catch {
      return false;
    }
  }

  async findByDevice(userId: number, deviceId: string): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findUnique({
      where: {
        userId_deviceId: { userId, deviceId },
      },
      include: { user: true }
    });
    
    if (!session || session.deletedAt) return null;
    return this.mapToDomain(session);
  }

  async findByRefreshToken(refreshToken: string, deviceId: string): Promise<UserSession | null> {
    const session = await this.prisma.userSession.findFirst({
      where: { 
        refreshToken, 
        deviceId,
        isRevoked: false, 
        deletedAt: null 
      },
      include: { user: true }
    });
    return session ? this.mapToDomain(session) : null;
  }

  async upsert(userId: number, deviceId: string, data: Partial<UserSession>): Promise<UserSession> {
    const session = await this.prisma.userSession.upsert({
      where: {
        userId_deviceId: { userId, deviceId }
      },
      update: {
        ...(data.deviceModel !== undefined ? { deviceModel: data.deviceModel } : {}),
        ...(data.osVersion !== undefined ? { osVersion: data.osVersion } : {}),
        ...(data.fcmToken !== undefined ? { fcmToken: data.fcmToken } : {}),
        ...(data.refreshToken !== undefined ? { refreshToken: data.refreshToken } : {}),
        lastActiveAt: new Date(),
        isRevoked: false
      },
      create: {
        userId,
        deviceId,
        deviceModel: data.deviceModel ?? null,
        osVersion: data.osVersion ?? null,
        fcmToken: data.fcmToken ?? null,
        refreshToken: data.refreshToken ?? null,
      },
      include: { user: true }
    });
    return this.mapToDomain(session);
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: { isRevoked: true, refreshToken: null }
    });
  }

  private mapToDomain(prismaSession: any): UserSession {
    return {
      id: prismaSession.id,
      publicId: prismaSession.publicId,
      userId: prismaSession.userId,
      deviceId: prismaSession.deviceId,
      deviceModel: prismaSession.deviceModel,
      osVersion: prismaSession.osVersion,
      fcmToken: prismaSession.fcmToken,
      refreshToken: prismaSession.refreshToken,
      isRevoked: prismaSession.isRevoked,
      lastActiveAt: prismaSession.lastActiveAt,
      createdAt: prismaSession.createdAt,
      updatedAt: prismaSession.updatedAt,
      deletedAt: prismaSession.deletedAt,
      user: prismaSession.user,
    };
  }
}
