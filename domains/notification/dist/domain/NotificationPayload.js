export class NotificationPayload {
    channel;
    templateId;
    recipient;
    recipientId;
    bookingId;
    title;
    body;
    data;
    constructor(props) {
        if (!props.templateId)
            throw new Error('Notification templateId is required');
        if (!props.recipient)
            throw new Error('Notification recipient destination is required');
        if (!props.recipientId)
            throw new Error('Notification recipientId is required');
        this.channel = props.channel;
        this.templateId = props.templateId;
        this.recipient = props.recipient;
        this.recipientId = props.recipientId;
        this.bookingId = props.bookingId ?? null;
        this.title = props.title ?? '';
        this.body = props.body ?? '';
        this.data = props.data ?? {};
    }
}
//# sourceMappingURL=NotificationPayload.js.map