import {
  IEmailProvider,
  INotificationProvider,
  IPushProvider,
  ISmsProvider,
  NotificationDispatchResult,
  NotificationPayload,
} from '@carbroz/common';

export class MultiChannelNotificationProvider implements INotificationProvider {
  constructor(
    private readonly pushProvider: IPushProvider,
    private readonly smsProvider: ISmsProvider,
    private readonly emailProvider: IEmailProvider
  ) {}

  async dispatch(payload: NotificationPayload): Promise<NotificationDispatchResult> {
    switch (payload.channel) {
      case 'PUSH': {
        const result = await this.pushProvider.sendPush({
          tokens: [payload.recipient],
          title: payload.title,
          body: payload.body,
          data: payload.data,
        });
        return {
          success: result.successCount > 0,
          provider: 'FIREBASE_FCM',
          providerReference: result.providerReference,
        };
      }
      case 'SMS': {
        const result = await this.smsProvider.sendSms({
          phoneNumber: payload.recipient,
          templateId: payload.templateId,
          text: payload.body,
        });
        return {
          success: result.success,
          provider: 'MSG91',
          providerReference: result.providerReference,
          errorCode: result.errorCode,
        };
      }
      case 'EMAIL': {
        const result = await this.emailProvider.sendEmail({
          toEmail: payload.recipient,
          subject: payload.title || 'Notification',
          htmlBody: payload.body,
          templateId: payload.templateId,
        });
        return {
          success: result.success,
          provider: 'RESEND',
          providerReference: result.providerReference,
          errorCode: result.errorCode,
        };
      }
      default:
        throw new Error(`Unsupported notification channel: ${payload.channel}`);
    }
  }
}
