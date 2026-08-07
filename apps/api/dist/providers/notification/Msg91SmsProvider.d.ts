import { ISmsProvider, SmsInput, SmsResult } from '@carbroz/foundation-kernel';
export declare class Msg91SmsProvider implements ISmsProvider {
    sendSms(input: SmsInput): Promise<SmsResult>;
}
