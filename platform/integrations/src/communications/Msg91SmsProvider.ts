import { ISmsProvider, SmsInput, SmsResult } from '@carbroz/domain-communications';
import type { ILoggerProvider } from '@carbroz/platform-observability';

interface Msg91FlowResponse {
  request_id?: string;
  message?: string;
  type?: string;
}

/** MSG91 Flow API adapter. Provider secrets remain at the technical integration boundary. */
export class Msg91SmsProvider implements ISmsProvider {
  constructor(private readonly logger: ILoggerProvider) {}

  async sendSms(input: SmsInput): Promise<SmsResult> {
    if (!input.phoneNumber) return { success: false, errorCode: 'MISSING_PHONE_NUMBER' };
    if (!input.templateId) return { success: false, errorCode: 'MISSING_TEMPLATE_ID' };

    const authKey = process.env.MSG91_AUTH_KEY;
    if (!authKey) {
      const errorCode = 'MSG91_NOT_CONFIGURED';
      this.logger.warn('provider.sms.msg91.configuration_missing', {
        provider: 'MSG91',
        operation: 'sendSms',
        errorCode,
      });
      return { success: false, errorCode };
    }

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

      if (!response.ok) {
        const errorCode = `MSG91_HTTP_${response.status}`;
        this.logger.warn('provider.sms.msg91.http_failed', {
          provider: 'MSG91',
          operation: 'sendSms',
          statusCode: response.status,
          errorCode,
        });
        return { success: false, errorCode };
      }

      let payload: Msg91FlowResponse | null;
      try {
        payload = await response.json() as Msg91FlowResponse | null;
      } catch {
        const errorCode = 'MSG91_INVALID_RESPONSE';
        this.logger.warn('provider.sms.msg91.invalid_response', {
          provider: 'MSG91',
          operation: 'sendSms',
          statusCode: response.status,
          errorCode,
        });
        return { success: false, errorCode };
      }

      if (!payload || payload.type === 'error') {
        const errorCode = payload?.type === 'error'
          ? `MSG91_HTTP_${response.status}`
          : 'MSG91_INVALID_RESPONSE';
        this.logger.warn(
          payload?.type === 'error'
            ? 'provider.sms.msg91.provider_rejected'
            : 'provider.sms.msg91.invalid_response',
          {
            provider: 'MSG91',
            operation: 'sendSms',
            statusCode: response.status,
            errorCode,
          },
        );
        return { success: false, errorCode };
      }

      return {
        success: true,
        providerReference: payload.request_id ?? payload.message,
      };
    } catch (error) {
      const errorCode = 'MSG91_UNAVAILABLE';
      this.logger.error('provider.sms.msg91.unavailable', undefined, {
        provider: 'MSG91',
        operation: 'sendSms',
        errorCode,
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
      return { success: false, errorCode };
    }
  }

  /** Identity OTP delivery surface implemented without exposing the OTP outside provider transport. */
  async sendOtp(input: { phoneNumber: string; otp: string }): Promise<SmsResult> {
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
    const variableName = process.env.MSG91_OTP_VARIABLE_NAME;
    if (!templateId || !variableName) {
      const errorCode = 'MSG91_OTP_NOT_CONFIGURED';
      this.logger.warn('provider.sms.msg91.delivery_configuration_missing', {
        provider: 'MSG91',
        operation: 'sendOtp',
        errorCode,
      });
      return { success: false, errorCode };
    }

    return this.sendSms({
      phoneNumber: input.phoneNumber,
      templateId,
      variables: { [variableName]: input.otp },
    });
  }
}
