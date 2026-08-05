export interface PaymentWebhookProps {
    id?: number;
    publicId?: string;
    provider: string;
    eventId: string;
    eventType: string;
    payloadHash: string;
    processingStatus?: string;
    receivedAt?: Date;
    processedAt?: Date | null;
    failureReason?: string | null;
    retryCount?: number;
}
export declare class PaymentWebhook {
    id?: number;
    publicId?: string;
    provider: string;
    eventId: string;
    eventType: string;
    payloadHash: string;
    processingStatus: string;
    receivedAt: Date;
    processedAt: Date | null;
    failureReason: string | null;
    retryCount: number;
    constructor(props: PaymentWebhookProps);
    markProcessed(): void;
    markFailed(reason: string): void;
}
