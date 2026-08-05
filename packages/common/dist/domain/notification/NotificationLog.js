export class NotificationLog {
    id;
    publicId;
    bookingId;
    recipientId;
    channel;
    provider;
    templateId;
    providerReference;
    recipient;
    status;
    errorCode;
    sentAt;
    createdAt;
    constructor(props) {
        if (!props.recipientId)
            throw new Error('NotificationLog must be associated with a recipientId');
        if (!props.recipient)
            throw new Error('NotificationLog recipient is required');
        if (!props.templateId)
            throw new Error('NotificationLog templateId is required');
        this.id = props.id;
        this.publicId = props.publicId;
        this.bookingId = props.bookingId ?? null;
        this.recipientId = props.recipientId;
        this.channel = props.channel;
        this.provider = props.provider;
        this.templateId = props.templateId;
        this.providerReference = props.providerReference ?? null;
        this.recipient = props.recipient;
        this.status = props.status ?? 'SENT';
        this.errorCode = props.errorCode ?? null;
        this.sentAt = props.sentAt ?? new Date();
        this.createdAt = props.createdAt;
    }
}
//# sourceMappingURL=NotificationLog.js.map