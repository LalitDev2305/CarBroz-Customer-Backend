import { PrismaClient } from '@prisma/client';
import { INotificationLogRepository, NotificationChannel, NotificationLog, NotificationStatus } from '@carbroz/common';

export class PrismaNotificationLogRepository implements INotificationLogRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  private mapToDomain(record: any): NotificationLog {
    return new NotificationLog({
      id: record.id,
      publicId: record.publicId,
      bookingId: record.bookingId,
      recipientId: record.recipientId,
      channel: record.channel as NotificationChannel,
      provider: record.provider,
      templateId: record.templateId,
      providerReference: record.providerReference,
      recipient: record.recipient,
      status: record.status as NotificationStatus,
      errorCode: record.errorCode,
      sentAt: record.sentAt,
      createdAt: record.createdAt,
    });
  }

  async create(log: NotificationLog): Promise<NotificationLog> {
    const record = await this.prisma.notificationLog.create({
      data: {
        bookingId: log.bookingId,
        recipientId: log.recipientId,
        channel: log.channel,
        provider: log.provider,
        templateId: log.templateId,
        providerReference: log.providerReference,
        recipient: log.recipient,
        status: log.status,
        errorCode: log.errorCode,
        sentAt: log.sentAt,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<NotificationLog | null> {
    const record = await this.prisma.notificationLog.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<NotificationLog | null> {
    const record = await this.prisma.notificationLog.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async listByRecipientId(recipientId: number, limit = 50, offset = 0): Promise<NotificationLog[]> {
    const records = await this.prisma.notificationLog.findMany({
      where: { recipientId },
      take: limit,
      skip: offset,
      orderBy: { sentAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async listByBookingId(bookingId: number): Promise<NotificationLog[]> {
    const records = await this.prisma.notificationLog.findMany({
      where: { bookingId },
      orderBy: { sentAt: 'asc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }
}
