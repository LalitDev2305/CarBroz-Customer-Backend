import { EmailInput, EmailResult, IEmailProvider } from '@carbroz/foundation-kernel';
export declare class ResendEmailProvider implements IEmailProvider {
    sendEmail(input: EmailInput): Promise<EmailResult>;
}
