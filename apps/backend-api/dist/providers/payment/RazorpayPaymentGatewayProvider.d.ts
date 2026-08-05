import { CreatePaymentOrderInput, IPaymentGatewayProvider, PaymentOrderResult, WebhookEventPayload } from '@carbroz/common';
export declare class RazorpayPaymentGatewayProvider implements IPaymentGatewayProvider {
    private readonly keyId;
    private readonly keySecret;
    constructor(keyId?: string, keySecret?: string);
    createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
    verifyWebhookSignature(rawBodyBuffer: Buffer, signature: string, secret: string): boolean;
    parseWebhookEvent(rawBodyString: string): WebhookEventPayload;
}
