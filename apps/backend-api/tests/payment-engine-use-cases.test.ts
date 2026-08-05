import crypto from 'node:crypto';
import { describe, expect, it, beforeEach } from 'vitest';
import { CreatePaymentOrderUseCase } from '../src/modules/payment/use-cases/CreatePaymentOrderUseCase.js';
import { ProcessPaymentWebhookUseCase } from '../src/modules/payment/use-cases/ProcessPaymentWebhookUseCase.js';
import { GenerateInvoiceUseCase } from '../src/modules/invoice/use-cases/GenerateInvoiceUseCase.js';
import { CreatePayoutEligibilityUseCase } from '../src/modules/payout/use-cases/CreatePayoutEligibilityUseCase.js';
import { RazorpayPaymentGatewayProvider } from '../src/providers/payment/RazorpayPaymentGatewayProvider.js';
import {
  Booking,
  Invoice,
  IPaymentRepository,
  IInvoiceRepository,
  IPartnerPayoutRepository,
  PartnerPayout,
  Payment,
  PaymentWebhook,
  ITransactionProvider,
} from '@carbroz/common';

class MemoryPaymentRepository implements IPaymentRepository {
  public payments: Payment[] = [];
  public webhooks: PaymentWebhook[] = [];
  private nextId = 1;

  async create(payment: Payment): Promise<Payment> {
    payment.id = this.nextId++;
    payment.publicId = `pay_${payment.id}`;
    this.payments.push(payment);
    return payment;
  }

  async findById(id: number): Promise<Payment | null> {
    return this.payments.find((p) => p.id === id) ?? null;
  }

  async findByPublicId(publicId: string): Promise<Payment | null> {
    return this.payments.find((p) => p.publicId === publicId) ?? null;
  }

  async findByBookingId(bookingId: number): Promise<Payment | null> {
    return this.payments.find((p) => p.bookingId === bookingId) ?? null;
  }

  async findByProviderOrderId(orderId: string): Promise<Payment | null> {
    return this.payments.find((p) => p.providerOrderId === orderId) ?? null;
  }

  async findByProviderPaymentId(paymentId: string): Promise<Payment | null> {
    return this.payments.find((p) => p.providerPaymentId === paymentId) ?? null;
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    return this.payments.find((p) => p.idempotencyKey === key) ?? null;
  }

  async update(payment: Payment): Promise<Payment> {
    const idx = this.payments.findIndex((p) => p.id === payment.id);
    if (idx !== -1) this.payments[idx] = payment;
    return payment;
  }

  async saveWebhook(webhook: PaymentWebhook): Promise<PaymentWebhook> {
    webhook.id = this.nextId++;
    webhook.publicId = `wh_${webhook.id}`;
    this.webhooks.push(webhook);
    return webhook;
  }

  async findWebhookByEventId(provider: string, eventId: string): Promise<PaymentWebhook | null> {
    return this.webhooks.find((w) => w.provider === provider && w.eventId === eventId) ?? null;
  }

  async updateWebhook(webhook: PaymentWebhook): Promise<PaymentWebhook> {
    const idx = this.webhooks.findIndex((w) => w.id === webhook.id);
    if (idx !== -1) this.webhooks[idx] = webhook;
    return webhook;
  }
}

class MemoryInvoiceRepository implements IInvoiceRepository {
  public items: Invoice[] = [];
  private nextId = 1;

  async create(invoice: Invoice): Promise<Invoice> {
    invoice.id = this.nextId++;
    invoice.publicId = `inv_${invoice.id}`;
    this.items.push(invoice);
    return invoice;
  }

  async findById(id: number): Promise<Invoice | null> {
    return this.items.find((i) => i.id === id) ?? null;
  }

  async findByPublicId(publicId: string): Promise<Invoice | null> {
    return this.items.find((i) => i.publicId === publicId) ?? null;
  }

  async findByBookingId(bookingId: number): Promise<Invoice | null> {
    return this.items.find((i) => i.bookingId === bookingId) ?? null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return this.items.find((i) => i.invoiceNumber === invoiceNumber) ?? null;
  }

  async generateNextInvoiceNumber(): Promise<string> {
    return `INV-2026-${(this.items.length + 1).toString().padStart(6, '0')}`;
  }
}

class MemoryPayoutRepository implements IPartnerPayoutRepository {
  public items: PartnerPayout[] = [];
  private nextId = 1;

  async create(payout: PartnerPayout): Promise<PartnerPayout> {
    payout.id = this.nextId++;
    payout.publicId = `po_${payout.id}`;
    this.items.push(payout);
    return payout;
  }

  async findById(id: number): Promise<PartnerPayout | null> {
    return this.items.find((p) => p.id === id) ?? null;
  }

  async findByPublicId(publicId: string): Promise<PartnerPayout | null> {
    return this.items.find((p) => p.publicId === publicId) ?? null;
  }

  async findByBookingId(bookingId: number): Promise<PartnerPayout | null> {
    return this.items.find((p) => p.bookingId === bookingId) ?? null;
  }

  async listByPartnerId(partnerId: number, status?: any): Promise<PartnerPayout[]> {
    return this.items.filter((p) => p.partnerId === partnerId && (!status || p.status === status));
  }

  async listByStatus(status: any, limit = 50, offset = 0): Promise<PartnerPayout[]> {
    return this.items.filter((p) => p.status === status).slice(offset, offset + limit);
  }

  async update(payout: PartnerPayout): Promise<PartnerPayout> {
    const idx = this.items.findIndex((p) => p.id === payout.id);
    if (idx !== -1) this.items[idx] = payout;
    return payout;
  }
}

describe('Payment Engine Use Cases & Webhook Security', () => {
  let paymentRepo: MemoryPaymentRepository;
  let invoiceRepo: MemoryInvoiceRepository;
  let payoutRepo: MemoryPayoutRepository;
  let bookingRepo: any;
  let provider: RazorpayPaymentGatewayProvider;
  let txProvider: ITransactionProvider;

  let createOrderUseCase: CreatePaymentOrderUseCase;
  let generateInvoiceUseCase: GenerateInvoiceUseCase;
  let processWebhookUseCase: ProcessPaymentWebhookUseCase;
  let createPayoutUseCase: CreatePayoutEligibilityUseCase;

  const dummyBooking = new Booking({
    id: 100,
    publicId: 'bk_100',
    customerId: 10,
    partnerId: 5,
    vehicleId: 1,
    addressId: 1,
    serviceId: 1,
    status: 'CREATED',
    slotStartTime: new Date(Date.now() + 3600000),
    slotEndTime: new Date(Date.now() + 7200000),
    totalPricePaise: 47200,
    snapshots: {
      service: { serviceId: 1, name: 'Basic Wash', basePricePaise: 40000, estimatedDurationMinutes: 60 },
      addons: [],
      pricing: { basePricePaise: 40000, addonsTotalPaise: 0, vehicleMultiplier: 1.0, subtotalPaise: 40000, taxesPaise: 7200, totalPricePaise: 47200 },
      address: { addressLine1: '123 MG Road', city: 'Bangalore', state: 'Karnataka', postalCode: '560001', country: 'India' },
      vehicle: { make: 'Hyundai', model: 'i20', year: 2022, registrationNumber: 'KA01AB1234', fuelType: 'PETROL' },
    },
  });

  beforeEach(() => {
    paymentRepo = new MemoryPaymentRepository();
    invoiceRepo = new MemoryInvoiceRepository();
    payoutRepo = new MemoryPayoutRepository();
    provider = new RazorpayPaymentGatewayProvider('dummy_key', 'test_secret');
    txProvider = { runInTransaction: async (cb) => cb() };

    bookingRepo = {
      findById: async (id: number) => (id === 100 ? dummyBooking : null),
      findByPublicId: async (pubId: string) => (pubId === 'bk_100' ? dummyBooking : null),
      update: async (b: Booking) => b,
    };

    createOrderUseCase = new CreatePaymentOrderUseCase(paymentRepo, bookingRepo, provider);
    generateInvoiceUseCase = new GenerateInvoiceUseCase(invoiceRepo, bookingRepo);
    processWebhookUseCase = new ProcessPaymentWebhookUseCase(
      paymentRepo,
      bookingRepo,
      provider,
      generateInvoiceUseCase,
      txProvider
    );
    createPayoutUseCase = new CreatePayoutEligibilityUseCase(payoutRepo, bookingRepo);
  });

  it('should create payment checkout order', async () => {
    const res = await createOrderUseCase.execute({ bookingPublicId: 'bk_100', customerId: 10 });
    expect(res.payment.status).toBe('PENDING');
    expect(res.payment.amountPaise).toBe(47200);
    expect(res.checkoutParams.orderId).toBeDefined();
  });

  it('should process payment webhook safely and generate tax invoice', async () => {
    const { payment } = await createOrderUseCase.execute({ bookingPublicId: 'bk_100', customerId: 10 });

    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      event_id: 'evt_test_999',
      payload: {
        payment: {
          entity: {
            id: 'pay_99999',
            order_id: payment.providerOrderId,
            amount: 47200,
            status: 'captured',
          },
        },
      },
    });

    const rawBuffer = Buffer.from(rawPayload, 'utf8');

    // Generate valid HMAC signature
    const signature = crypto
      .createHmac('sha256', 'test_secret')
      .update(rawBuffer)
      .digest('hex');

    const result = await processWebhookUseCase.execute({
      rawBodyBuffer: rawBuffer,
      signature,
      webhookSecret: 'test_secret',
    });

    expect(result.processed).toBe(true);

    const updatedPayment = await paymentRepo.findByBookingId(100);
    expect(updatedPayment?.status).toBe('SUCCESS');

    const invoice = await invoiceRepo.findByBookingId(100);
    expect(invoice).toBeDefined();
    expect(invoice?.invoiceNumber).toContain('INV-2026-');
  });

  it('should enforce webhook replay protection for duplicate event IDs', async () => {
    const { payment } = await createOrderUseCase.execute({ bookingPublicId: 'bk_100', customerId: 10 });

    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      event_id: 'evt_duplicate_111',
      payload: {
        payment: {
          entity: {
            id: 'pay_11111',
            order_id: payment.providerOrderId,
            amount: 47200,
            status: 'captured',
          },
        },
      },
    });

    const rawBuffer = Buffer.from(rawPayload, 'utf8');
    const signature = crypto.createHmac('sha256', 'test_secret').update(rawBuffer).digest('hex');

    await processWebhookUseCase.execute({ rawBodyBuffer: rawBuffer, signature, webhookSecret: 'test_secret' });

    // Replayed Webhook Call
    const replayResult = await processWebhookUseCase.execute({ rawBodyBuffer: rawBuffer, signature, webhookSecret: 'test_secret' });
    expect(replayResult.message).toContain('idempotent');
  });

  it('should reject invalid webhook HMAC signature', async () => {
    const rawBuffer = Buffer.from('{"event":"payment.captured"}', 'utf8');
    await expect(
      processWebhookUseCase.execute({
        rawBodyBuffer: rawBuffer,
        signature: 'invalid_signature_hash',
        webhookSecret: 'test_secret',
      })
    ).rejects.toThrow('Invalid webhook signature');
  });

  it('should create partner payout eligibility only after booking COMPLETED', async () => {
    dummyBooking.status = 'COMPLETED';

    const payout = await createPayoutUseCase.execute(100);
    expect(payout.status).toBe('SCHEDULED');
    expect(payout.grossAmountPaise).toBe(47200);
    expect(payout.netPayoutPaise).toBe(39648); // 47200 - 15% (7080) - 1% (472)
  });
});
