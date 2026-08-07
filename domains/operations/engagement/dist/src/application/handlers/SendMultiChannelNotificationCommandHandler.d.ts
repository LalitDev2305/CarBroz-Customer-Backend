import { NotificationLog } from '../../domain/entities/NotificationLog.js';
import { NotificationChannel } from '../../domain/enums/NotificationChannel.js';
import { PrismaNotificationLogRepository } from '../../infrastructure/persistence/prisma/PrismaNotificationLogRepository.js';
export interface SendNotificationInput {
    userId: number;
    channel: NotificationChannel;
    templateId: string;
    recipient: string;
    title?: string;
    body?: string;
    metadata?: Record<string, any>;
}
export declare class SendMultiChannelNotificationCommandHandler {
    private readonly notificationRepository;
    constructor(notificationRepository: PrismaNotificationLogRepository);
    execute(input: SendNotificationInput): Promise<NotificationLog>;
}
