import { NotificationPayload, } from '@carbroz/common';
export class SendNotificationUseCase {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async execute(input) {
        const payload = new NotificationPayload({
            channel: input.channel,
            templateId: input.templateId,
            recipient: input.recipient,
            recipientId: input.recipientId,
            bookingId: input.bookingId,
            title: input.title,
            body: input.body,
            data: input.data,
        });
        return await this.notificationService.send(payload);
    }
}
//# sourceMappingURL=SendNotificationUseCase.js.map