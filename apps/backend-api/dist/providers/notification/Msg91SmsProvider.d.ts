import { ISmsProvider, SmsInput, SmsResult } from '@carbroz/common';
export declare class Msg91SmsProvider implements ISmsProvider {
    sendSms(input: SmsInput): Promise<SmsResult>;
}
