import { IPushProvider, PushNotificationInput, PushNotificationResult } from '@carbroz/foundation-kernel';
export declare class FirebasePushProvider implements IPushProvider {
    sendPush(input: PushNotificationInput): Promise<PushNotificationResult>;
}
