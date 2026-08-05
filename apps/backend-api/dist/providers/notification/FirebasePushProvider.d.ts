import { IPushProvider, PushNotificationInput, PushNotificationResult } from '@carbroz/common';
export declare class FirebasePushProvider implements IPushProvider {
    sendPush(input: PushNotificationInput): Promise<PushNotificationResult>;
}
