import { PrismaProvider } from '@carbroz/platform-database';
import { NotificationLog } from '../../../domain/entities/NotificationLog.js';
export declare class PrismaNotificationLogRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    private mapToDomain;
    create(log: NotificationLog): Promise<NotificationLog>;
    findById(id: number): Promise<NotificationLog | null>;
    findByPublicId(publicId: string): Promise<NotificationLog | null>;
    listByRecipientId(recipientId: number, limit?: number, offset?: number): Promise<NotificationLog[]>;
    listByBookingId(bookingId: number): Promise<NotificationLog[]>;
}
