import { DomainError } from "@carbroz/foundation-kernel";
import type { NotificationLog } from "../domain/NotificationLog.js";
import type { INotificationLogRepository } from "../domain/repositories/INotificationLogRepository.js";

/** Resolves a notification and marks its in-memory domain state as read. */
export class MarkNotificationReadUseCase {
  constructor(
    private readonly notificationRepository: INotificationLogRepository,
  ) {}

  async execute(notificationId: number): Promise<NotificationLog> {
    const log = await this.notificationRepository.findById(notificationId);
    if (!log)
      throw new DomainError(
        "Notification log with ID " + notificationId + " not found",
      );
    log.status = "READ";
    return log;
  }
}
