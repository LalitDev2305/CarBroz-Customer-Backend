/** EmailInput is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface EmailInput {
  toEmail: string;
  subject: string;
  htmlBody: string;
  templateId?: string;
}

/** EmailResult is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface EmailResult {
  success: boolean;
  providerReference?: string;
  errorCode?: string;
}

/** IEmailProvider is an exported domains/communications contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IEmailProvider {
  sendEmail(input: EmailInput): Promise<EmailResult>;
}
