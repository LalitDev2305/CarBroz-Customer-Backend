import { type IPushProvider, type PushNotificationInput, type PushNotificationResult } from '@carbroz/domain-communications';

export class FirebasePushProvider implements IPushProvider {
  async sendPush(input: PushNotificationInput): Promise<PushNotificationResult> {
    if (!input.tokens || input.tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    // Provider delivery stub (Firebase Cloud Messaging HTTP v1 API)
    const providerReference = `fcm_msg_${Date.now()}`;
    return {
      successCount: input.tokens.length,
      failureCount: 0,
      providerReference,
    };
  }
}
