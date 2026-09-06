import { INotificationLogRepository } from '../../domain/repositories/INotificationLogRepository.js';
import { NotificationLog } from '../../domain/NotificationLog.js';
/** ListNotificationHistoryInput is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ListNotificationHistoryInput {
  recipientId: number;
  limit?: number;
  offset?: number;
}

/** ListNotificationHistoryUseCase is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export class ListNotificationHistoryUseCase {
  constructor(private readonly notificationLogRepository: INotificationLogRepository) {}

  /** Executes this application operation through its declared ports and domain invariants. */
  async execute(input: ListNotificationHistoryInput): Promise<NotificationLog[]> {
    return await this.notificationLogRepository.listByRecipientId(
      input.recipientId,
      input.limit ?? 50,
      input.offset ?? 0
    );
  }
}
