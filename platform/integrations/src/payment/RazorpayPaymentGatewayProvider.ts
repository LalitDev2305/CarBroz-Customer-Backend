import crypto from 'node:crypto';
import type {
  IPaymentGatewayProvider,
  PaymentGatewayCreateOrderInput,
  PaymentGatewayOrderResult,
  PaymentGatewayWebhookEventPayload,
} from '@carbroz/domain-financials';

function isUnsafeProductionCredential(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === 'mock'
    || normalized === 'dummy'
    || normalized === 'dummy_secret'
    || normalized.startsWith('replace_with_')
    || normalized.startsWith('change-me')
    || normalized.startsWith('change_me');
}

export class RazorpayPaymentGatewayProvider implements IPaymentGatewayProvider {
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(
    keyId = process.env.RAZORPAY_KEY_ID,
    keySecret = process.env.RAZORPAY_KEY_SECRET,
  ) {
    const normalizedKeyId = keyId?.trim() ?? '';
    const normalizedKeySecret = keySecret?.trim() ?? '';

    if (process.env.NODE_ENV === 'production') {
      if (!normalizedKeyId || !normalizedKeySecret) {
        throw new Error('Production Razorpay configuration is incomplete');
      }
      if (
        /^rzp_test_/i.test(normalizedKeyId)
        || isUnsafeProductionCredential(normalizedKeyId)
        || isUnsafeProductionCredential(normalizedKeySecret)
      ) {
        throw new Error('Production Razorpay configuration must use live credentials');
      }
    }

    this.keyId = normalizedKeyId || 'rzp_test_dummy';
    this.keySecret = normalizedKeySecret || 'dummy_secret';
  }

  async createOrder(input: PaymentGatewayCreateOrderInput): Promise<PaymentGatewayOrderResult> {
    const providerOrderId = `order_${input.idempotencyKey.slice(0, 14)}`;
    return {
      providerOrderId,
      amountPaise: input.amountPaise,
      currency: input.currency,
      keyId: this.keyId,
    };
  }

  verifyWebhookSignature(rawBodyBuffer: Buffer, signature: string, secret: string): boolean {
    if (!signature || !secret || !rawBodyBuffer) return false;
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBodyBuffer).digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');
    if (expectedBuffer.length !== receivedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  }

  parseWebhookEvent(rawBodyString: string): PaymentGatewayWebhookEventPayload {
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
      failureCode: entity.error_code,
      failureReason: entity.error_description,
      rawBody: rawBodyString,
    };
  }
}
