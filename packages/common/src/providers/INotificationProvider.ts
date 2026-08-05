import { NotificationPayload } from '../domain/notification/NotificationPayload.js';

export interface NotificationDispatchResult {
  success: boolean;
  provider: string;
  providerReference?: string;
  errorCode?: string;
}

export interface INotificationProvider {
  dispatch(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
