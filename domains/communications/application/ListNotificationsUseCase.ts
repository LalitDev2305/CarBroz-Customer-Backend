import type { NotificationLog } from '../domain/NotificationLog.js';
import type { INotificationLogRepository } from '../domain/repositories/INotificationLogRepository.js';

/** Lists notification history through the bounded-context repository port. */
export class ListNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationLogRepository) {}

  async execute(userId: number): Promise<NotificationLog[]> {
    return this.notificationRepository.listByRecipientId(userId);
  }
}
