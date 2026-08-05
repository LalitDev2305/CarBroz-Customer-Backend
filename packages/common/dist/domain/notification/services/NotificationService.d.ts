import { NotificationPayload } from '../NotificationPayload.js';
import { NotificationLog } from '../NotificationLog.js';
import { INotificationLogRepository } from '../repositories/INotificationLogRepository.js';
import { INotificationProvider } from '../../../providers/INotificationProvider.js';
export declare class NotificationService {
    private readonly notificationLogRepository;
    private readonly notificationProvider;
    constructor(notificationLogRepository: INotificationLogRepository, notificationProvider: INotificationProvider);
    send(payload: NotificationPayload): Promise<NotificationLog>;
}
