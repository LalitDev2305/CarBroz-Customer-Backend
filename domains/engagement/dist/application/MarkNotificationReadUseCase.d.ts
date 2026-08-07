import { NotificationLog } from '../domain/NotificationLog.js';
import { PrismaNotificationLogRepository } from '../infrastructure/repositories/PrismaNotificationLogRepository.js';
export declare class MarkNotificationReadUseCase {
    private readonly notificationRepository;
    constructor(notificationRepository: PrismaNotificationLogRepository);
    execute(notificationId: number): Promise<NotificationLog>;
}
//# sourceMappingURL=MarkNotificationReadUseCase.d.ts.map