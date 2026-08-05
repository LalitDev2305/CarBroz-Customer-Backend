import { NotificationChannel, NotificationLog, NotificationService } from '@carbroz/common';
export interface SendNotificationInput {
    channel: NotificationChannel;
    templateId: string;
    recipient: string;
    recipientId: number;
    bookingId?: number;
    title?: string;
    body?: string;
    data?: Record<string, any>;
}
export declare class SendNotificationUseCase {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    execute(input: SendNotificationInput): Promise<NotificationLog>;
}
