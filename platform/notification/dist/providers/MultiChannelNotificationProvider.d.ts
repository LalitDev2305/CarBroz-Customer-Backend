import { IEmailProvider, INotificationProvider, IPushProvider, ISmsProvider, NotificationDispatchResult, NotificationPayload } from '@carbroz/foundation-kernel';
export declare class MultiChannelNotificationProvider implements INotificationProvider {
    private readonly pushProvider;
    private readonly smsProvider;
    private readonly emailProvider;
    constructor(pushProvider: IPushProvider, smsProvider: ISmsProvider, emailProvider: IEmailProvider);
    dispatch(payload: NotificationPayload): Promise<NotificationDispatchResult>;
}
