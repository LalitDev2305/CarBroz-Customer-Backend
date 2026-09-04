import type { INotificationLogRepository } from '@carbroz/common';
import type { NotificationLog } from '../domain/NotificationLog.js';

/**
 * Marks an existing notification as read using the Communications repository contract.
 *
 * This use case owns the not-found guard and state change. Persistence implementation details
 * remain behind INotificationLogRepository and must never leak into application orchestration.
 */
export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: INotificationLogRepository) {}

  public async execute(notificationId: number): Promise<NotificationLog> {
    const log = await this.notificationRepository.findById(notificationId);
    if (!log) {
      throw new Error(`Notification log with ID ${notificationId} not found`);
    }
    log.status = 'READ';
    return log;
  }
}
