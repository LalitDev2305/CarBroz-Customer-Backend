import { NotificationChannel } from '../../domain/NotificationChannel.js';
import { NotificationLog } from '../../domain/NotificationLog.js';
import { NotificationPayload } from '../../domain/NotificationPayload.js';
import { NotificationService } from '../../domain/services/NotificationService.js';
/** SendNotificationInput is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
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

/** SendNotificationUseCase is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export class SendNotificationUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  /** Executes this application operation through its declared ports and domain invariants. */
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
