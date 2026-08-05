import { NotificationLog } from '@carbroz/common';
export class PrismaNotificationLogRepository {
    prismaClient;
    unitOfWorkPrisma = null;
    constructor(prismaClient) {
        this.prismaClient = prismaClient;
    }
    get prisma() {
        return this.unitOfWorkPrisma || this.prismaClient;
    }
    mapToDomain(record) {
        return new NotificationLog({
            id: record.id,
            publicId: record.publicId,
            bookingId: record.bookingId,
            recipientId: record.recipientId,
            channel: record.channel,
            provider: record.provider,
            templateId: record.templateId,
            providerReference: record.providerReference,
            recipient: record.recipient,
            status: record.status,
            errorCode: record.errorCode,
            sentAt: record.sentAt,
            createdAt: record.createdAt,
        });
    }
    async create(log) {
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
    async findById(id) {
        const record = await this.prisma.notificationLog.findUnique({ where: { id } });
        return record ? this.mapToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.notificationLog.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async listByRecipientId(recipientId, limit = 50, offset = 0) {
        const records = await this.prisma.notificationLog.findMany({
            where: { recipientId },
            take: limit,
            skip: offset,
            orderBy: { sentAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async listByBookingId(bookingId) {
        const records = await this.prisma.notificationLog.findMany({
            where: { bookingId },
            orderBy: { sentAt: 'asc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
}
//# sourceMappingURL=PrismaNotificationLogRepository.js.map