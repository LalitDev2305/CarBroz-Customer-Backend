/** SmsInput is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface SmsInput {
  phoneNumber: string;
  templateId: string;
  variables?: Record<string, string>;
  text?: string;
}

/** SmsResult is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface SmsResult {
  success: boolean;
  providerReference?: string;
  errorCode?: string;
}

/** ISmsProvider is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface ISmsProvider {
  sendSms(input: SmsInput): Promise<SmsResult>;
}
