import { NotificationLog } from '../../domain/entities/NotificationLog.js';
export class SendMultiChannelNotificationCommandHandler {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(input) {
        const log = new NotificationLog({
            recipientId: input.userId,
            recipient: input.recipient,
            channel: input.channel,
            provider: 'FCM_OR_DEFAULT',
            templateId: input.templateId,
            status: 'SENT',
        });
        return this.notificationRepository.create(log);
    }
}
//# sourceMappingURL=SendMultiChannelNotificationCommandHandler.js.map