import { ISmsProvider, SmsInput, SmsResult } from '@carbroz/common';

export class Msg91SmsProvider implements ISmsProvider {
  async sendSms(input: SmsInput): Promise<SmsResult> {
    if (!input.phoneNumber) {
      return { success: false, errorCode: 'MISSING_PHONE_NUMBER' };
    }

    // Provider delivery stub (Msg91 Flow API)
    const providerReference = `msg91_${Date.now()}`;
    return {
      success: true,
      providerReference,
    };
  }
}
