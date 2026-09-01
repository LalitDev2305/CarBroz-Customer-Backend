import {
  NotificationChannel,
  NotificationLog,
  NotificationPayload,
  NotificationService,
} from '@carbroz/common';

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
      bookingId: input.bookingId,
      title: input.title,
      body: input.body,
      data: input.data,
    });

    return await this.notificationService.send(payload);
  }
}
