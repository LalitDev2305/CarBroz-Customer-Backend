import crypto from 'node:crypto';
export class RazorpayPaymentGatewayProvider {
    keyId;
    keySecret;
    constructor(keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy', keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret') {
        this.keyId = keyId;
        this.keySecret = keySecret;
    }
    async createOrder(input) {
        const providerOrderId = `order_${input.idempotencyKey.slice(0, 14)}`;
        return {
            providerOrderId,
            amountPaise: input.amountPaise,
            currency: input.currency,
            keyId: this.keyId,
        };
    }
    verifyWebhookSignature(rawBodyBuffer, signature, secret) {
        if (!signature || !secret || !rawBodyBuffer)
            return false;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBodyBuffer)
            .digest('hex');
        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
        const receivedBuffer = Buffer.from(signature, 'utf8');
        if (expectedBuffer.length !== receivedBuffer.length) {
            return false;
        }
        return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    }
    parseWebhookEvent(rawBodyString) {
        const payload = JSON.parse(rawBodyString);
        const event = payload.event || 'payment.captured';
        const entity = payload.payload?.payment?.entity || {};
        return {
            provider: 'RAZORPAY',
            eventId: payload.event_id || `evt_${Date.now()}`,
            eventType: event,
            providerOrderId: entity.order_id || payload.order_id,
            providerPaymentId: entity.id || payload.payment_id,
            amountPaise: entity.amount || payload.amount,
            status: entity.status,
            rawBody: rawBodyString,
        };
    }
}
//# sourceMappingURL=RazorpayPaymentGatewayProvider.js.map