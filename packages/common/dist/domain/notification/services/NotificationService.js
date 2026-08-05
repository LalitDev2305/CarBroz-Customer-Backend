import { NotificationLog } from '../NotificationLog.js';
export class NotificationService {
    notificationLogRepository;
    notificationProvider;
    constructor(notificationLogRepository, notificationProvider) {
        this.notificationLogRepository = notificationLogRepository;
        this.notificationProvider = notificationProvider;
    }
    async send(payload) {
        const dispatchResult = await this.notificationProvider.dispatch(payload);
        const log = new NotificationLog({
            bookingId: payload.bookingId,
            recipientId: payload.recipientId,
            channel: payload.channel,
            provider: dispatchResult.provider,
            templateId: payload.templateId,
            providerReference: dispatchResult.providerReference || null,
            recipient: payload.recipient,
            status: dispatchResult.success ? 'SENT' : 'FAILED',
            errorCode: dispatchResult.errorCode || null,
            sentAt: new Date(),
        });
        return await this.notificationLogRepository.create(log);
    }
}
//# sourceMappingURL=NotificationService.js.map