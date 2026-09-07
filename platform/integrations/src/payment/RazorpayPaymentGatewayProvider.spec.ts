import { afterEach, describe, expect, it, vi } from 'vitest';
import { RazorpayPaymentGatewayProvider } from './RazorpayPaymentGatewayProvider.js';

const orderInput = {
  bookingPublicId: 'booking_01JTESTCONFIG000000000001',
  idempotencyKey: 'idem_12345678901234567890',
  amountPaise: 125000,
  currency: 'INR',
};

describe('RazorpayPaymentGatewayProvider configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows development fallback credentials only outside production', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('RAZORPAY_KEY_ID', '');
    vi.stubEnv('RAZORPAY_KEY_SECRET', '');

    const provider = new RazorpayPaymentGatewayProvider();
    const order = await provider.createOrder(orderInput);

    expect(order.keyId).toBe('rzp_test_dummy');
  });

  it('rejects missing production credentials', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RAZORPAY_KEY_ID', '');
    vi.stubEnv('RAZORPAY_KEY_SECRET', '');

    expect(() => new RazorpayPaymentGatewayProvider())
      .toThrow('Production Razorpay configuration is incomplete');
  });

  it('rejects test or placeholder credentials in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(() => new RazorpayPaymentGatewayProvider('rzp_test_carbroz', 'live-looking-secret'))
      .toThrow('Production Razorpay configuration must use live credentials');
    expect(() => new RazorpayPaymentGatewayProvider('rzp_live_carbroz', 'dummy_secret'))
      .toThrow('Production Razorpay configuration must use live credentials');
  });

  it('accepts explicit live credentials in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const provider = new RazorpayPaymentGatewayProvider(
      'rzp_live_carbrozproduction',
      'razorpay-production-secret',
    );
    const order = await provider.createOrder(orderInput);

    expect(order.keyId).toBe('rzp_live_carbrozproduction');
  });
});
