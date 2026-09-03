import { type INotificationLogRepository } from '../domain/repositories/INotificationLogRepository.js';
import { NotificationLog } from '../domain/NotificationLog.js';

export interface ListNotificationHistoryInput {
  recipientId: number;
  limit?: number;
  offset?: number;
}

export class ListNotificationHistoryUseCase {
  constructor(private readonly notificationLogRepository: INotificationLogRepository) {}

  async execute(input: ListNotificationHistoryInput): Promise<NotificationLog[]> {
    return await this.notificationLogRepository.listByRecipientId(
      input.recipientId,
      input.limit ?? 50,
      input.offset ?? 0
    );
  }
}
