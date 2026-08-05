export interface CreatePaymentOrderInput {
    bookingPublicId: string;
    amountPaise: number;
    currency: string;
    idempotencyKey: string;
}
export interface PaymentOrderResult {
    providerOrderId: string;
    amountPaise: number;
    currency: string;
    keyId?: string;
}
export interface WebhookEventPayload {
    provider: string;
    eventId: string;
    eventType: string;
    providerOrderId?: string;
    providerPaymentId?: string;
    amountPaise?: number;
    status?: string;
    failureCode?: string;
    failureReason?: string;
    rawBody: string;
}
export interface IPaymentGatewayProvider {
    createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
    verifyWebhookSignature(rawBodyBuffer: Buffer, signature: string, secret: string): boolean;
    parseWebhookEvent(rawBodyString: string): WebhookEventPayload;
}
