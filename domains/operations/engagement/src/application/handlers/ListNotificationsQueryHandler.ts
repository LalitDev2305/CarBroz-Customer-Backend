import { NotificationLog } from '../../domain/entities/NotificationLog.js';
import { PrismaNotificationLogRepository } from '../../infrastructure/persistence/prisma/PrismaNotificationLogRepository.js';


export class ListNotificationsQueryHandler {
  constructor(private readonly notificationRepository: PrismaNotificationLogRepository) {}

  public async execute(userId: number): Promise<NotificationLog[]> {
    return this.notificationRepository.listByRecipientId(userId);
  }
}
