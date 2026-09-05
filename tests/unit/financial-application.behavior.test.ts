import { describe, expect, it, vi } from 'vitest';
import { Money } from '@carbroz/foundation-kernel';
import {
  CreatePaymentOrderUseCase,
  CreatePayoutEligibilityUseCase,
  GenerateInvoiceUseCase,
  GetInvoiceUseCase,
  GetPaymentUseCase,
  ListPartnerPayoutsUseCase,
  MarkPayoutPaidUseCase,
  ProcessPaymentWebhookUseCase,
  ProcessPayoutBatchUseCase,
} from '@carbroz/domain-financials';

const future = () => new Date(Date.now() + 60_000);
const past = () => new Date(Date.now() - 60_000);

function booking(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    publicId: 'booking-public',
    customerId: 7,
    partnerId: 22,
    status: 'CREATED',
    expiryAt: future(),
    totalPricePaise: 12_000,
    confirm: vi.fn(),
    snapshots: {
      service: { name: 'Deep Wash' },
      address: { addressLine1: 'A-1', city: 'Pune', state: 'MH', postalCode: '411001' },
      pricing: { basePricePaise: 10_000, addonsTotalPaise: 2_000, subtotalPaise: 12_000 },
    },
    ...overrides,
  };
}

function paymentRepo(overrides: Record<string, unknown> = {}) {
  return {
    findByBookingId: vi.fn().mockResolvedValue(null),
    findByPublicId: vi.fn().mockResolvedValue(null),
    findByProviderOrderId: vi.fn().mockResolvedValue(null),
    findByProviderPaymentId: vi.fn().mockResolvedValue(null),
    findWebhookByEventId: vi.fn().mockResolvedValue(null),
    create: vi.fn(async (value) => value),
    update: vi.fn(async (value) => value),
    saveWebhook: vi.fn(async (value) => value),
    updateWebhook: vi.fn(async (value) => value),
    ...overrides,
  };
}

function bookingRepo(value: unknown = booking()) {
  return {
    findByPublicId: vi.fn().mockResolvedValue(value),
    findById: vi.fn().mockResolvedValue(value),
    update: vi.fn(async (item) => item),
  };
}

function gateway(overrides: Record<string, unknown> = {}) {
  return {
    createOrder: vi.fn().mockResolvedValue({ providerOrderId: 'order-1', amountPaise: 12_000, currency: 'INR', keyId: 'key' }),
    verifyWebhookSignature: vi.fn().mockReturnValue(true),
    parseWebhookEvent: vi.fn().mockReturnValue({ provider: 'RAZORPAY', eventId: 'evt-1', eventType: 'payment.captured', providerOrderId: 'order-1', providerPaymentId: 'pay-1' }),
    ...overrides,
  };
}

const taxCalculator = {
  calculateInvoiceTax: vi.fn((subtotal: Money) => ({
    cgst: Money.fromMinor(1_080, 'INR'),
    sgst: Money.fromMinor(1_080, 'INR'),
    igst: Money.fromMinor(0, 'INR'),
    totalTax: Money.fromMinor(2_160, 'INR'),
    totalPrice: Money.fromMinor(subtotal.amountMinor + 2_160, 'INR'),
  })),
  calculatePartnerPayout: vi.fn((gross: Money) => ({
    grossAmount: gross,
    commissionPercentage: 15,
    commission: Money.fromMinor(1_800, 'INR'),
    tdsPercentage: 1,
    tds: Money.fromMinor(120, 'INR'),
    netPayout: Money.fromMinor(gross.amountMinor - 1_920, 'INR'),
    appliedRules: ['COMMISSION_15', 'TDS_1'],
  })),
};

describe('Financial application behavior', () => {
  describe('CreatePaymentOrderUseCase', () => {
    it('rejects missing and foreign bookings', async () => {
      const repo = paymentRepo();
      const useCaseMissing = new CreatePaymentOrderUseCase(repo as any, bookingRepo(null) as any, gateway() as any);
      await expect(useCaseMissing.execute({ bookingPublicId: 'x', customerId: 7 })).rejects.toThrow('Booking not found or unauthorized');

      const useCaseForeign = new CreatePaymentOrderUseCase(repo as any, bookingRepo(booking({ customerId: 99 })) as any, gateway() as any);
      await expect(useCaseForeign.execute({ bookingPublicId: 'x', customerId: 7 })).rejects.toThrow('Booking not found or unauthorized');
    });

    it.each(['CANCELLED', 'EXPIRED', 'COMPLETED'])('rejects terminal booking status %s', async (status) => {
      const useCase = new CreatePaymentOrderUseCase(paymentRepo() as any, bookingRepo(booking({ status })) as any, gateway() as any);
      await expect(useCase.execute({ bookingPublicId: 'x', customerId: 7 })).rejects.toThrow(`Cannot create payment for booking in status ${status}`);
    });

    it('rejects an expired slot hold and an already successful payment', async () => {
      const expiredUseCase = new CreatePaymentOrderUseCase(paymentRepo() as any, bookingRepo(booking({ expiryAt: past() })) as any, gateway() as any);
      await expect(expiredUseCase.execute({ bookingPublicId: 'x', customerId: 7 })).rejects.toThrow('Booking slot hold has expired');

      const successful = { status: 'SUCCESS' };
      const paidUseCase = new CreatePaymentOrderUseCase(paymentRepo({ findByBookingId: vi.fn().mockResolvedValue(successful) }) as any, bookingRepo() as any, gateway() as any);
      await expect(paidUseCase.execute({ bookingPublicId: 'x', customerId: 7 })).rejects.toThrow('Booking has already been successfully paid');
    });

    it('returns an existing pending payment idempotently including the missing provider-order fallback', async () => {
      for (const providerOrderId of ['existing-order', undefined]) {
        const pending = { status: 'PENDING', providerOrderId, amountPaise: 12_000, currency: 'INR' };
        const repo = paymentRepo({ findByBookingId: vi.fn().mockResolvedValue(pending) });
        const gw = gateway();
        const useCase = new CreatePaymentOrderUseCase(repo as any, bookingRepo() as any, gw as any);
        const result = await useCase.execute({ bookingPublicId: 'x', customerId: 7 });
        expect(result.payment).toBe(pending);
        expect(result.checkoutParams.providerOrderId).toBe(providerOrderId ?? '');
        expect(gw.createOrder).not.toHaveBeenCalled();
      }
    });

    it('creates a deterministic gateway order and pending payment when no reusable payment exists', async () => {
      const repo = paymentRepo();
      const gw = gateway();
      const useCase = new CreatePaymentOrderUseCase(repo as any, bookingRepo() as any, gw as any);
      const result = await useCase.execute({ bookingPublicId: 'booking-public', customerId: 7 });
      expect(gw.createOrder).toHaveBeenCalledWith(expect.objectContaining({ bookingPublicId: 'booking-public', amountPaise: 12_000, currency: 'INR' }));
      expect(gw.createOrder.mock.calls[0][0].idempotencyKey).toMatch(/^[a-f0-9]{64}$/);
      expect(repo.create).toHaveBeenCalledOnce();
      expect(result.checkoutParams.providerOrderId).toBe('order-1');
      expect(result.payment.status).toBe('PENDING');
    });
  });

  describe('payment and invoice reads', () => {
    it('enforces payment ownership and returns an owned payment', async () => {
      const repo = paymentRepo();
      const uc = new GetPaymentUseCase(repo as any);
      await expect(uc.execute('missing', 7)).rejects.toThrow('Payment record not found or unauthorized');
      repo.findByPublicId.mockResolvedValueOnce({ customerId: 8 });
      await expect(uc.execute('foreign', 7)).rejects.toThrow('Payment record not found or unauthorized');
      const owned = { customerId: 7, publicId: 'p-1' };
      repo.findByPublicId.mockResolvedValueOnce(owned);
      await expect(uc.execute('p-1', 7)).resolves.toBe(owned);
    });

    it('returns an existing invoice, rejects a missing booking, and creates a complete tax snapshot', async () => {
      const existing = { publicId: 'invoice-existing' };
      const existingRepo = { findByBookingId: vi.fn().mockResolvedValue(existing) };
      await expect(new GenerateInvoiceUseCase(existingRepo as any, bookingRepo() as any, taxCalculator as any).execute(10)).resolves.toBe(existing);

      const missingRepo = { findByBookingId: vi.fn().mockResolvedValue(null), generateNextInvoiceNumber: vi.fn(), create: vi.fn() };
      await expect(new GenerateInvoiceUseCase(missingRepo as any, bookingRepo(null) as any, taxCalculator as any).execute(10)).rejects.toThrow('Booking not found');

      for (const sellerGstin of ['', '27ABCDE1234F1Z5']) {
        const invoiceRepo = {
          findByBookingId: vi.fn().mockResolvedValue(null),
          generateNextInvoiceNumber: vi.fn().mockResolvedValue('INV-0001'),
          create: vi.fn(async (invoice) => invoice),
        };
        const result = await new GenerateInvoiceUseCase(invoiceRepo as any, bookingRepo() as any, taxCalculator as any, sellerGstin).execute(10);
        expect(result.invoiceNumber).toBe('INV-0001');
        expect(result.documentJson).toMatchObject({
          bookingPublicId: 'booking-public',
          serviceName: 'Deep Wash',
          subtotalPaise: 12_000,
          totalTaxPaise: 2_160,
          totalPricePaise: 14_160,
          sellerGstin: sellerGstin || undefined,
        });
      }
    });

    it('returns an invoice by public id and rejects a missing invoice', async () => {
      const repo = { findByPublicId: vi.fn().mockResolvedValue(null) };
      const uc = new GetInvoiceUseCase(repo as any);
      await expect(uc.execute('missing')).rejects.toThrow('Invoice not found');
      const invoice = { publicId: 'inv-1' };
      repo.findByPublicId.mockResolvedValueOnce(invoice);
      await expect(uc.execute('inv-1')).resolves.toBe(invoice);
    });
  });

  describe('ProcessPaymentWebhookUseCase', () => {
    const transaction = { runInTransaction: vi.fn(async (work) => work()) };
    const invoice = { execute: vi.fn().mockResolvedValue({}) };

    it('rejects an invalid signature and returns idempotently for an already processed event', async () => {
      const invalid = gateway({ verifyWebhookSignature: vi.fn().mockReturnValue(false) });
      const ucInvalid = new ProcessPaymentWebhookUseCase(paymentRepo() as any, bookingRepo() as any, invalid as any, invoice as any, transaction as any);
      await expect(ucInvalid.execute({ rawBodyBuffer: Buffer.from('{}'), signature: 'bad', webhookSecret: 'secret' })).rejects.toThrow('Invalid webhook signature');

      const repo = paymentRepo({ findWebhookByEventId: vi.fn().mockResolvedValue({ processingStatus: 'PROCESSED' }) });
      const uc = new ProcessPaymentWebhookUseCase(repo as any, bookingRepo() as any, gateway() as any, invoice as any, transaction as any);
      await expect(uc.execute({ rawBodyBuffer: Buffer.from('{}'), signature: 'ok', webhookSecret: 'secret' })).resolves.toEqual({ processed: true, message: 'Webhook event already processed (idempotent response)' });
      expect(repo.saveWebhook).not.toHaveBeenCalled();
    });

    it('processes captured payments by provider order id, confirms a CREATED booking and generates its invoice', async () => {
      const payment = { bookingId: 10, customerId: 7, markSuccess: vi.fn() };
      const repo = paymentRepo({ findByProviderOrderId: vi.fn().mockResolvedValue(payment) });
      const b = booking();
      const bookings = bookingRepo(b);
      const uc = new ProcessPaymentWebhookUseCase(repo as any, bookings as any, gateway() as any, invoice as any, transaction as any);
      await expect(uc.execute({ rawBodyBuffer: Buffer.from('{"x":1}'), signature: 'ok', webhookSecret: 'secret' })).resolves.toEqual({ processed: true, message: 'Webhook event processed successfully' });
      expect(payment.markSuccess).toHaveBeenCalledWith('pay-1');
      expect(b.confirm).toHaveBeenCalledWith(7);
      expect(bookings.update).toHaveBeenCalledWith(b);
      expect(invoice.execute).toHaveBeenCalledWith(10);
      expect(repo.saveWebhook).toHaveBeenCalledOnce();
      expect(repo.updateWebhook).toHaveBeenCalledOnce();
    });

    it('finds captured payments by payment id when order id is absent and does not reconfirm non-created bookings', async () => {
      const payment = { bookingId: 10, customerId: 7, markSuccess: vi.fn() };
      const repo = paymentRepo({ findByProviderPaymentId: vi.fn().mockResolvedValue(payment) });
      const gw = gateway({ parseWebhookEvent: vi.fn().mockReturnValue({ provider: 'RAZORPAY', eventId: 'evt-2', eventType: 'order.paid', providerPaymentId: 'pay-2' }) });
      const b = booking({ status: 'CONFIRMED' });
      const bookings = bookingRepo(b);
      const uc = new ProcessPaymentWebhookUseCase(repo as any, bookings as any, gw as any, invoice as any, transaction as any);
      await uc.execute({ rawBodyBuffer: Buffer.from('{}'), signature: 'ok', webhookSecret: 'secret' });
      expect(repo.findByProviderPaymentId).toHaveBeenCalledWith('pay-2');
      expect(payment.markSuccess).toHaveBeenCalledWith('pay-2');
      expect(b.confirm).not.toHaveBeenCalled();
    });

    it('accepts captured events with no payment identifiers or an unresolved payment without mutating payment state', async () => {
      for (const event of [
        { provider: 'RAZORPAY', eventId: 'evt-no-id', eventType: 'payment.captured' },
        { provider: 'RAZORPAY', eventId: 'evt-no-payment', eventType: 'payment.captured', providerOrderId: 'missing' },
      ]) {
        const repo = paymentRepo();
        const gw = gateway({ parseWebhookEvent: vi.fn().mockReturnValue(event) });
        const uc = new ProcessPaymentWebhookUseCase(repo as any, bookingRepo() as any, gw as any, invoice as any, transaction as any);
        await expect(uc.execute({ rawBodyBuffer: Buffer.from('{}'), signature: 'ok', webhookSecret: 'secret' })).resolves.toMatchObject({ processed: true });
        expect(repo.update).not.toHaveBeenCalled();
      }
    });

    it('marks failed payments with gateway detail and canonical fallbacks, and ignores failed events without an order id', async () => {
      for (const event of [
        { provider: 'RAZORPAY', eventId: 'evt-f1', eventType: 'payment.failed', providerOrderId: 'order-f', failureCode: 'DECLINED', failureReason: 'Bank declined' },
        { provider: 'RAZORPAY', eventId: 'evt-f2', eventType: 'payment.failed', providerOrderId: 'order-f' },
      ]) {
        const payment = { markFailed: vi.fn() };
        const repo = paymentRepo({ findByProviderOrderId: vi.fn().mockResolvedValue(payment) });
        const gw = gateway({ parseWebhookEvent: vi.fn().mockReturnValue(event) });
        const uc = new ProcessPaymentWebhookUseCase(repo as any, bookingRepo() as any, gw as any, invoice as any, transaction as any);
        await uc.execute({ rawBodyBuffer: Buffer.from('{}'), signature: 'ok', webhookSecret: 'secret' });
        expect(payment.markFailed).toHaveBeenCalledWith(event.failureCode ?? 'PAYMENT_FAILED', event.failureReason ?? 'Payment failed at gateway');
        expect(repo.update).toHaveBeenCalledWith(payment);
      }

      const repo = paymentRepo();
      const gw = gateway({ parseWebhookEvent: vi.fn().mockReturnValue({ provider: 'RAZORPAY', eventId: 'evt-f3', eventType: 'payment.failed' }) });
      await new ProcessPaymentWebhookUseCase(repo as any, bookingRepo() as any, gw as any, invoice as any, transaction as any)
        .execute({ rawBodyBuffer: Buffer.from('{}'), signature: 'ok', webhookSecret: 'secret' });
      expect(repo.findByProviderOrderId).not.toHaveBeenCalled();
    });

    it('processes unknown events without payment mutations and reuses an existing unprocessed webhook', async () => {
      const existing = { processingStatus: 'PENDING', markProcessed: vi.fn(), markFailed: vi.fn() };
      const repo = paymentRepo({ findWebhookByEventId: vi.fn().mockResolvedValue(existing) });
      const gw = gateway({ parseWebhookEvent: vi.fn().mockReturnValue({ provider: 'RAZORPAY', eventId: 'evt-x', eventType: 'refund.created' }) });
      const uc = new ProcessPaymentWebhookUseCase(repo as any, bookingRepo() as any, gw as any, invoice as any, transaction as any);
      await uc.execute({ rawBodyBuffer: Buffer.from('{}'), signature: 'ok', webhookSecret: 'secret' });
      expect(repo.saveWebhook).not.toHaveBeenCalled();
      expect(existing.markProcessed).toHaveBeenCalledOnce();
      expect(repo.updateWebhook).toHaveBeenCalledWith(existing);
    });

    it('marks webhook failure before rethrowing both Error and non-Error processing failures', async () => {
      for (const thrown of [new Error('invoice failed'), 'raw failure']) {
        const webhook = { processingStatus: 'PENDING', markProcessed: vi.fn(), markFailed: vi.fn() };
        const payment = { bookingId: 10, customerId: 7, markSuccess: vi.fn() };
        const repo = paymentRepo({
          findWebhookByEventId: vi.fn().mockResolvedValue(webhook),
          findByProviderOrderId: vi.fn().mockResolvedValue(payment),
        });
        const failingInvoice = { execute: vi.fn().mockRejectedValue(thrown) };
        const uc = new ProcessPaymentWebhookUseCase(repo as any, bookingRepo(booking({ status: 'CONFIRMED' })) as any, gateway() as any, failingInvoice as any, transaction as any);
        await expect(uc.execute({ rawBodyBuffer: Buffer.from('{}'), signature: 'ok', webhookSecret: 'secret' })).rejects.toBe(thrown);
        expect(webhook.markFailed).toHaveBeenCalledWith(thrown instanceof Error ? thrown.message : 'Processing failed');
        expect(repo.updateWebhook).toHaveBeenCalledWith(webhook);
      }
    });
  });

  describe('payout application behavior', () => {
    it('returns existing eligibility and rejects every invalid booking eligibility shape', async () => {
      const existing = { publicId: 'payout-existing' };
      const existingRepo = { findByBookingId: vi.fn().mockResolvedValue(existing) };
      await expect(new CreatePayoutEligibilityUseCase(existingRepo as any, bookingRepo() as any, taxCalculator as any).execute(10)).resolves.toBe(existing);

      for (const invalid of [null, booking({ status: 'CONFIRMED' }), booking({ partnerId: null })]) {
        const repo = { findByBookingId: vi.fn().mockResolvedValue(null) };
        await expect(new CreatePayoutEligibilityUseCase(repo as any, bookingRepo(invalid) as any, taxCalculator as any).execute(10))
          .rejects.toThrow('Payout eligibility requires a COMPLETED booking with an assigned partner');
      }
    });

    it('creates a scheduled payout from the canonical tax/commission calculation', async () => {
      const repo = { findByBookingId: vi.fn().mockResolvedValue(null), create: vi.fn(async (value) => value) };
      const result = await new CreatePayoutEligibilityUseCase(repo as any, bookingRepo(booking({ status: 'COMPLETED' })) as any, taxCalculator as any).execute(10);
      expect(result.status).toBe('SCHEDULED');
      expect(result.partnerId).toBe(22);
      expect(result.calculationJson).toMatchObject({ grossAmountPaise: 12_000, commissionPercentage: 15, commissionPaise: 1_800, tdsPercentage: 1, tdsPaise: 120, netPayoutPaise: 10_080 });
    });

    it('delegates partner payout listing with and without status', async () => {
      const repo = { listByPartnerId: vi.fn().mockResolvedValue([]) };
      const uc = new ListPartnerPayoutsUseCase(repo as any);
      await uc.execute(22);
      await uc.execute(22, 'PAID' as any);
      expect(repo.listByPartnerId).toHaveBeenNthCalledWith(1, 22, undefined);
      expect(repo.listByPartnerId).toHaveBeenNthCalledWith(2, 22, 'PAID');
    });

    it('requires a reference and existing payout before marking it paid', async () => {
      const repo = { findByPublicId: vi.fn().mockResolvedValue(null), update: vi.fn() };
      const uc = new MarkPayoutPaidUseCase(repo as any);
      await expect(uc.execute({ publicId: 'p', externalReference: '   ' })).rejects.toThrow('External reference is required');
      await expect(uc.execute({ publicId: 'missing', externalReference: 'bank-ref' })).rejects.toThrow('Partner payout record not found');

      const payout = { markPaid: vi.fn() };
      repo.findByPublicId.mockResolvedValueOnce(payout);
      repo.update.mockImplementationOnce(async (value) => value);
      await expect(uc.execute({ publicId: 'p', externalReference: 'bank-ref' })).resolves.toBe(payout);
      expect(payout.markPaid).toHaveBeenCalledWith('bank-ref');
    });

    it('approves and moves every scheduled payout to processing and handles an empty batch', async () => {
      const first = { approve: vi.fn(), markProcessing: vi.fn() };
      const second = { approve: vi.fn(), markProcessing: vi.fn() };
      const repo = { listByStatus: vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([first, second]), update: vi.fn(async (value) => value) };
      const uc = new ProcessPayoutBatchUseCase(repo as any);
      await expect(uc.execute()).resolves.toBe(0);
      await expect(uc.execute()).resolves.toBe(2);
      for (const payout of [first, second]) {
        expect(payout.approve).toHaveBeenCalledOnce();
        expect(payout.markProcessing).toHaveBeenCalledOnce();
        expect(repo.update).toHaveBeenCalledWith(payout);
      }
    });
  });
});
