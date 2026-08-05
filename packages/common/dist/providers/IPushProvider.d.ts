export interface PushNotificationInput {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, any>;
}
export interface PushNotificationResult {
    successCount: number;
    failureCount: number;
    providerReference?: string;
}
export interface IPushProvider {
    sendPush(input: PushNotificationInput): Promise<PushNotificationResult>;
}
