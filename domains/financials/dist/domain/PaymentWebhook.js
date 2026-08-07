export class PaymentWebhook {
    id;
    publicId;
    provider;
    eventId;
    eventType;
    payloadHash;
    processingStatus;
    receivedAt;
    processedAt;
    failureReason;
    retryCount;
    constructor(props) {
        if (!props.eventId)
            throw new Error('Webhook eventId is required');
        if (!props.eventType)
            throw new Error('Webhook eventType is required');
        this.id = props.id;
        this.publicId = props.publicId;
        this.provider = props.provider ?? 'RAZORPAY';
        this.eventId = props.eventId;
        this.eventType = props.eventType;
        this.payloadHash = props.payloadHash;
        this.processingStatus = props.processingStatus ?? 'PENDING';
        this.receivedAt = props.receivedAt ?? new Date();
        this.processedAt = props.processedAt ?? null;
        this.failureReason = props.failureReason ?? null;
        this.retryCount = props.retryCount ?? 0;
    }
    markProcessed() {
        this.processingStatus = 'PROCESSED';
        this.processedAt = new Date();
    }
    markFailed(reason) {
        this.processingStatus = 'FAILED';
        this.failureReason = reason;
        this.retryCount += 1;
    }
}
//# sourceMappingURL=PaymentWebhook.js.map