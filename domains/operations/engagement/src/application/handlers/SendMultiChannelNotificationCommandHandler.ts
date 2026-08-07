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

export class SendMultiChannelNotificationCommandHandler {
  constructor(private readonly notificationRepository: PrismaNotificationLogRepository) {}

  public async execute(input: SendNotificationInput): Promise<NotificationLog> {
    const log = new NotificationLog({
      recipientId: input.userId,
      recipient: input.recipient,
      channel: input.channel,
      provider: 'FCM_OR_DEFAULT',
      templateId: input.templateId,
      status: 'SENT',
    });

    return this.notificationRepository.create(log);
  }
}
