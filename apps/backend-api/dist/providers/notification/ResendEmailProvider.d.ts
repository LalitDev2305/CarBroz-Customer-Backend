import { EmailInput, EmailResult, IEmailProvider } from '@carbroz/common';
export declare class ResendEmailProvider implements IEmailProvider {
    sendEmail(input: EmailInput): Promise<EmailResult>;
}
