import { NotificationLog } from '../domain/NotificationLog.js';
import { PrismaNotificationLogRepository } from '../infrastructure/repositories/PrismaNotificationLogRepository.js';
export declare class ListNotificationsUseCase {
    private readonly notificationRepository;
    constructor(notificationRepository: PrismaNotificationLogRepository);
    execute(userId: number): Promise<NotificationLog[]>;
}
//# sourceMappingURL=ListNotificationsUseCase.d.ts.map