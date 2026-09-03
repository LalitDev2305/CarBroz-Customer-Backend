import { type NotificationChannel } from '../domain/NotificationChannel.js';
import { NotificationLog } from '../domain/NotificationLog.js';
import { NotificationPayload } from '../domain/NotificationPayload.js';
import { NotificationService } from '../domain/services/NotificationService.js';

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

export class SendNotificationUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  async execute(input: SendNotificationInput): Promise<NotificationLog> {
    const payload = new NotificationPayload({
      channel: input.channel,
      templateId: input.templateId,
      recipient: input.recipient,
      recipientId: input.recipientId,
      bookingId: input.bookingId ?? null,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.data !== undefined ? { data: input.data } : {}),
    });

    return await this.notificationService.send(payload);
  }
}
