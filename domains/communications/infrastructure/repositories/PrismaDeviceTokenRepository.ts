import { PrismaClient } from '@prisma/client';
import { DeviceToken, IDeviceTokenRepository } from '@carbroz/common';

export class PrismaDeviceTokenRepository implements IDeviceTokenRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  private mapToDomain(record: any): DeviceToken {
    return new DeviceToken({
      id: record.id,
      publicId: record.publicId,
      userId: record.userId,
      deviceId: record.deviceId,
      platform: record.platform as any,
      token: record.token,
      appVersion: record.appVersion,
      lastSeenAt: record.lastSeenAt,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async upsert(token: DeviceToken): Promise<DeviceToken> {
    const record = await this.prisma.deviceToken.upsert({
      where: { token: token.token },
      update: {
        userId: token.userId,
        deviceId: token.deviceId,
        platform: token.platform,
        appVersion: token.appVersion,
        lastSeenAt: new Date(),
        isActive: true,
      },
      create: {
        userId: token.userId,
        deviceId: token.deviceId,
        platform: token.platform,
        token: token.token,
        appVersion: token.appVersion,
        lastSeenAt: token.lastSeenAt,
        isActive: token.isActive,
      },
    });
    return this.mapToDomain(record);
  }

  async findByToken(token: string): Promise<DeviceToken | null> {
    const record = await this.prisma.deviceToken.findUnique({ where: { token } });
    return record ? this.mapToDomain(record) : null;
  }

  async listActiveByUserId(userId: number): Promise<DeviceToken[]> {
    const records = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
      orderBy: { lastSeenAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async deactivate(userId: number, deviceId: string): Promise<void> {
    await this.prisma.deviceToken.updateMany({
      where: { userId, deviceId },
      data: { isActive: false },
    });
  }
}
