import type { INotificationLogRepository } from '@carbroz/common';
import type { NotificationLog } from '../domain/NotificationLog.js';

/**
 * Lists notification history for a recipient through the Communications persistence port.
 *
 * The use case owns query orchestration only. Pagination/storage mechanics remain behind the
 * repository contract and no Prisma implementation may be imported here.
 */
export class ListNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationLogRepository) {}

  public async execute(userId: number): Promise<NotificationLog[]> {
    return this.notificationRepository.listByRecipientId(userId);
  }
}
