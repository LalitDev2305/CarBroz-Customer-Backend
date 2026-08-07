import { PrismaClient } from '@prisma/client';
import { INotificationLogRepository, NotificationLog } from '@carbroz/common';
export declare class PrismaNotificationLogRepository implements INotificationLogRepository {
    private readonly prismaClient;
    private unitOfWorkPrisma;
    constructor(prismaClient: PrismaClient);
    private get prisma();
    private mapToDomain;
    create(log: NotificationLog): Promise<NotificationLog>;
    findById(id: number): Promise<NotificationLog | null>;
    findByPublicId(publicId: string): Promise<NotificationLog | null>;
    listByRecipientId(recipientId: number, limit?: number, offset?: number): Promise<NotificationLog[]>;
    listByBookingId(bookingId: number): Promise<NotificationLog[]>;
}
//# sourceMappingURL=PrismaNotificationLogRepository.d.ts.map