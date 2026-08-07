export interface IFeatureFlagProvider {
    isEnabled(key: string): Promise<boolean>;
    getAllFlags(): Promise<Record<string, boolean>>;
}
export interface IFeatureFlagRepository {
    findByKey(key: string): Promise<{
        key: string;
        enabled: boolean;
    } | null>;
    findAllFlags(): Promise<Array<{
        key: string;
        enabled: boolean;
    }>>;
}
export interface NotificationPayload {
    channel: 'PUSH' | 'SMS' | 'EMAIL';
    tokens?: string[];
    phoneNumber?: string;
    toEmail?: string;
    title?: string;
    body: string;
    data?: Record<string, any>;
    templateId?: string;
}
export interface NotificationDispatchResult {
    success: boolean;
    messageId?: string;
    provider?: string;
    providerReference?: string;
    successCount?: number;
    failureCount?: number;
    errorCode?: string;
    errorMessage?: string;
}
export interface IPushProvider {
    sendPush(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
export interface ISmsProvider {
    sendSms(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
export interface IEmailProvider {
    sendEmail(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
export interface INotificationProvider {
    sendNotification(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
