import { EmailInput, EmailResult, IEmailProvider } from '@carbroz/common';

export class ResendEmailProvider implements IEmailProvider {
  async sendEmail(input: EmailInput): Promise<EmailResult> {
    if (!input.toEmail) {
      return { success: false, errorCode: 'MISSING_EMAIL_ADDRESS' };
    }

    // Provider delivery stub (Resend API)
    const providerReference = `resend_${Date.now()}`;
    return {
      success: true,
      providerReference,
    };
  }
}
