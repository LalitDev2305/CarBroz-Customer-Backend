import { INotificationLogRepository, NotificationLog } from '@carbroz/common';
export interface ListNotificationHistoryInput {
    recipientId: number;
    limit?: number;
    offset?: number;
}
export declare class ListNotificationHistoryUseCase {
    private readonly notificationLogRepository;
    constructor(notificationLogRepository: INotificationLogRepository);
    execute(input: ListNotificationHistoryInput): Promise<NotificationLog[]>;
}
