import { NotificationPayload } from '../../domain/NotificationPayload.js';

/** NotificationDispatchResult is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface NotificationDispatchResult {
  success: boolean;
  provider: string;
  providerReference?: string;
  errorCode?: string;
}

/** INotificationProvider is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface INotificationProvider {
  dispatch(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
