import { NotificationLog } from '../domain/NotificationLog.js';
import { NotificationChannel } from '../domain/NotificationChannel.js';
import { PrismaNotificationLogRepository } from '../infrastructure/repositories/PrismaNotificationLogRepository.js';
export interface SendNotificationInput {
    userId: number;
    channel: NotificationChannel;
    templateId: string;
    recipient: string;
    title?: string;
    body?: string;
    metadata?: Record<string, any>;
}
export declare class SendMultiChannelNotificationUseCase {
    private readonly notificationRepository;
    constructor(notificationRepository: PrismaNotificationLogRepository);
    execute(input: SendNotificationInput): Promise<NotificationLog>;
}
//# sourceMappingURL=SendMultiChannelNotificationUseCase.d.ts.map