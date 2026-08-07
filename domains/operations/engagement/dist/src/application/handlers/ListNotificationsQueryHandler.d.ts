import { NotificationLog } from '../../domain/entities/NotificationLog.js';
import { PrismaNotificationLogRepository } from '../../infrastructure/persistence/prisma/PrismaNotificationLogRepository.js';
export declare class ListNotificationsQueryHandler {
    private readonly notificationRepository;
    constructor(notificationRepository: PrismaNotificationLogRepository);
    execute(userId: number): Promise<NotificationLog[]>;
}
