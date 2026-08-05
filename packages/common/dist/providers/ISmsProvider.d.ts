export interface SmsInput {
    phoneNumber: string;
    templateId: string;
    variables?: Record<string, string>;
    text?: string;
}
export interface SmsResult {
    success: boolean;
    providerReference?: string;
    errorCode?: string;
}
export interface ISmsProvider {
    sendSms(input: SmsInput): Promise<SmsResult>;
}
