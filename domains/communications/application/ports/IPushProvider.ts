/** PushNotificationInput is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PushNotificationInput {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

/** PushNotificationResult is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PushNotificationResult {
  successCount: number;
  failureCount: number;
  providerReference?: string;
}

/** IPushProvider is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IPushProvider {
  sendPush(input: PushNotificationInput): Promise<PushNotificationResult>;
}
