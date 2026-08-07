import { NotificationLog } from '../../domain/entities/NotificationLog.js';
import { PrismaNotificationLogRepository } from '../../infrastructure/persistence/prisma/PrismaNotificationLogRepository.js';
export declare class MarkNotificationReadCommandHandler {
    private readonly notificationRepository;
    constructor(notificationRepository: PrismaNotificationLogRepository);
    execute(notificationId: number): Promise<NotificationLog>;
}
