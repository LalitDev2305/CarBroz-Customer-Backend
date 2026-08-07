import { PrismaClient } from '@prisma/client';
import { INotificationLogRepository, NotificationLog } from '@carbroz/foundation-kernel';
export declare class PrismaNotificationLogRepository implements INotificationLogRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(log: NotificationLog): Promise<NotificationLog>;
    findById(id: number): Promise<NotificationLog | null>;
    findByPublicId(publicId: string): Promise<NotificationLog | null>;
    listByRecipientId(recipientId: number, limit?: number, offset?: number): Promise<NotificationLog[]>;
    listByBookingId(bookingId: number): Promise<NotificationLog[]>;
}
//# sourceMappingURL=PrismaNotificationLogRepository.d.ts.map