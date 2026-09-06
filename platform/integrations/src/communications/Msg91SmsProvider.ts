import { ISmsProvider, SmsInput, SmsResult } from '@carbroz/domain-communications';

interface Msg91FlowResponse {
  request_id?: string;
  message?: string;
  type?: string;
}

/** MSG91 Flow API adapter. Provider secrets remain at the technical integration boundary. */
export class Msg91SmsProvider implements ISmsProvider {
  async sendSms(input: SmsInput): Promise<SmsResult> {
    if (!input.phoneNumber) return { success: false, errorCode: 'MISSING_PHONE_NUMBER' };
    if (!input.templateId) return { success: false, errorCode: 'MISSING_TEMPLATE_ID' };

    const authKey = process.env.MSG91_AUTH_KEY;
    if (!authKey) return { success: false, errorCode: 'MSG91_NOT_CONFIGURED' };

    try {
      const response = await fetch('https://control.msg91.com/api/v5/flow', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authkey: authKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          template_id: input.templateId,
          short_url: '0',
          recipients: [
            {
              mobiles: input.phoneNumber,
              ...(input.variables ?? {}),
            },
          ],
        }),
      });

      const payload = await response.json().catch(() => null) as Msg91FlowResponse | null;
      if (!response.ok || payload?.type === 'error') {
        return { success: false, errorCode: `MSG91_HTTP_${response.status}` };
      }

      return {
        success: true,
        providerReference: payload?.request_id ?? payload?.message,
      };
    } catch {
      return { success: false, errorCode: 'MSG91_UNAVAILABLE' };
    }
  }

  /** Identity OTP delivery surface implemented without exposing the OTP outside provider transport. */
  async sendOtp(input: { phoneNumber: string; otp: string }): Promise<SmsResult> {
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    const variableName = process.env.MSG91_OTP_VARIABLE_NAME;
    if (!templateId || !variableName) {
      return { success: false, errorCode: 'MSG91_OTP_NOT_CONFIGURED' };
    }

    return this.sendSms({
      phoneNumber: input.phoneNumber,
      templateId,
      variables: { [variableName]: input.otp },
    });
  }
}
