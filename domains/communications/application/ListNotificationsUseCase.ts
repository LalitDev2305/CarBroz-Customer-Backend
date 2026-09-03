import { NotificationLog } from '../domain/NotificationLog.js';
import { PrismaNotificationLogRepository } from '../infrastructure/repositories/PrismaNotificationLogRepository.js';

export class ListNotificationsUseCase {
  constructor(private readonly notificationRepository: PrismaNotificationLogRepository) {}

  public async execute(userId: number): Promise<NotificationLog[]> {
    return this.notificationRepository.listByRecipientId(userId);
  }
}
