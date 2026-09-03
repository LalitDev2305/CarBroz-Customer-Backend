export interface EmailInput {
  toEmail: string;
  subject: string;
  htmlBody: string;
  templateId?: string;
}

export interface EmailResult {
  success: boolean;
  providerReference?: string;
  errorCode?: string;
}

export interface IEmailProvider {
  sendEmail(input: EmailInput): Promise<EmailResult>;
}
