import { NotificationPayload } from '../NotificationPayload.js';
import { NotificationLog } from '../NotificationLog.js';
import { INotificationLogRepository } from '../repositories/INotificationLogRepository.js';
import { INotificationProvider } from '../../../providers/INotificationProvider.js';

export class NotificationService {
  constructor(
    private readonly notificationLogRepository: INotificationLogRepository,
    private readonly notificationProvider: INotificationProvider
  ) {}

  async send(payload: NotificationPayload): Promise<NotificationLog> {
    const dispatchResult = await this.notificationProvider.dispatch(payload);

    const log = new NotificationLog({
      bookingId: payload.bookingId,
      recipientId: payload.recipientId,
      channel: payload.channel,
      provider: dispatchResult.provider,
      templateId: payload.templateId,
      providerReference: dispatchResult.providerReference || null,
      recipient: payload.recipient,
      status: dispatchResult.success ? 'SENT' : 'FAILED',
      errorCode: dispatchResult.errorCode || null,
      sentAt: new Date(),
    });

    return await this.notificationLogRepository.create(log);
  }
}
