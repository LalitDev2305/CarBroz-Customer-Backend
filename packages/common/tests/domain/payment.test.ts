import { describe, expect, it } from 'vitest';
import { Payment } from '../../src/domain/payment/Payment.js';
import { PaymentWebhook } from '../../src/domain/payment/PaymentWebhook.js';

describe('Payment & Webhook Domain Entities', () => {
  it('should initialize payment with valid integer paise amount', () => {
    const p = new Payment({
      bookingId: 1,
      customerId: 10,
      amountPaise: 58882,
      idempotencyKey: 'idemp_123456',
    });

    expect(p.amountPaise).toBe(58882);
    expect(p.status).toBe('PENDING');
    expect(p.currency).toBe('INR');
  });

  it('should throw error for invalid non-integer or negative payment amounts', () => {
    expect(() => new Payment({ bookingId: 1, customerId: 10, amountPaise: -500, idempotencyKey: 'k' })).toThrow();
    expect(() => new Payment({ bookingId: 1, customerId: 10, amountPaise: 49.99 as any, idempotencyKey: 'k' })).toThrow();
  });

  it('should transition status to SUCCESS and record attempt', () => {
    const p = new Payment({
      bookingId: 1,
      customerId: 10,
      amountPaise: 58882,
      idempotencyKey: 'idemp_123456',
    });

    p.markSuccess('pay_razor_9999', 'UPI');
    expect(p.status).toBe('SUCCESS');
    expect(p.providerPaymentId).toBe('pay_razor_9999');
    expect(p.paidAt).toBeInstanceOf(Date);
    expect(p.attemptsJson.length).toBe(1);
  });

  it('should record refund on successful payment', () => {
    const p = new Payment({
      bookingId: 1,
      customerId: 10,
      amountPaise: 58882,
      idempotencyKey: 'idemp_123456',
    });

    p.markSuccess('pay_razor_9999', 'UPI');
    p.markRefunded('rfnd_1111', 58882, 'Customer requested refund');

    expect(p.status).toBe('REFUNDED');
    expect(p.refundedAt).toBeInstanceOf(Date);
    expect(p.refundsJson.length).toBe(1);
  });

  it('should handle PaymentWebhook lifecycle', () => {
    const wh = new PaymentWebhook({
      provider: 'RAZORPAY',
      eventId: 'evt_test_123',
      eventType: 'payment.captured',
      payloadHash: 'hash123',
    });

    expect(wh.processingStatus).toBe('PENDING');
    wh.markProcessed();
    expect(wh.processingStatus).toBe('PROCESSED');
    expect(wh.processedAt).toBeInstanceOf(Date);
  });
});
