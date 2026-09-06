import { NotificationLog } from '../NotificationLog.js';

/** INotificationLogRepository is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface INotificationLogRepository {
  create(log: NotificationLog): Promise<NotificationLog>;
  findById(id: number): Promise<NotificationLog | null>;
  findByPublicId(publicId: string): Promise<NotificationLog | null>;
  listByRecipientId(recipientId: number, limit?: number, offset?: number): Promise<NotificationLog[]>;
  listByBookingId(bookingId: number): Promise<NotificationLog[]>;
}
