import { NotificationLog } from '../NotificationLog.js';

export interface INotificationLogRepository {
  create(log: NotificationLog): Promise<NotificationLog>;
  findById(id: number): Promise<NotificationLog | null>;
  findByPublicId(publicId: string): Promise<NotificationLog | null>;
  listByRecipientId(recipientId: number, limit?: number, offset?: number): Promise<NotificationLog[]>;
  listByBookingId(bookingId: number): Promise<NotificationLog[]>;
}
