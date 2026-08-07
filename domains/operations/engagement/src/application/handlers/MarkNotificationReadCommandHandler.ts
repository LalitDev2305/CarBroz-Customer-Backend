import { NotificationLog } from '../../domain/entities/NotificationLog.js';
import { PrismaNotificationLogRepository } from '../../infrastructure/persistence/prisma/PrismaNotificationLogRepository.js';


export class MarkNotificationReadCommandHandler {
  constructor(private readonly notificationRepository: PrismaNotificationLogRepository) {}

  public async execute(notificationId: number): Promise<NotificationLog> {
    const log = await this.notificationRepository.findById(notificationId);
    if (!log) {
      throw new Error(`Notification log with ID ${notificationId} not found`);
    }
    log.status = 'READ';
    return log;
  }
}
