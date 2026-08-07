import { NotificationLog } from '../entities/NotificationLog.js';
export interface NotificationLogRepository {
    log(entry: Omit<NotificationLog, 'id' | 'sentAt'>): Promise<NotificationLog>;
    listByUserId(userId: number, limit?: number, offset?: number): Promise<NotificationLog[]>;
}
