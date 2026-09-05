import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { Payment } from '../../domain/Payment.js';
import { PaymentWebhook } from '../../domain/PaymentWebhook.js';
import { PrismaPaymentRepository } from './PrismaPaymentRepository.js';

const paymentRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  publicId: 'payment_1',
  bookingId: 10,
  customerId: 20,
  provider: 'RAZORPAY',
  providerOrderId: 'order_1',
  providerPaymentId: null,
  amountPaise: 49900,
  currency: 'INR',
  method: 'UPI',
  status: 'PENDING',
  idempotencyKey: 'idem_1',
  attemptsJson: [],
  refundsJson: [],
  failureCode: null,
  failureReason: null,
  paidAt: null,
  failedAt: null,
  refundedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  lockVersion: 1,
  ...overrides,
});

const webhookRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 2,
  publicId: 'webhook_2',
  provider: 'RAZORPAY',
  eventId: 'event_2',
  eventType: 'payment.captured',
  payloadHash: 'hash_2',
  processingStatus: 'PENDING',
  receivedAt: new Date('2026-01-01T00:00:00.000Z'),
  processedAt: null,
  failureReason: null,
  retryCount: 0,
  ...overrides,
});

function fixture() {
  const payment = { create: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() };
  const paymentWebhook = { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() };
  const prisma = { payment, paymentWebhook } as unknown as PrismaClient;
  return { repository: new PrismaPaymentRepository(prisma), payment, paymentWebhook };
}

function paymentDomain() {
  return new Payment({
    id: 1,
    publicId: 'payment_1',
    bookingId: 10,
    customerId: 20,
    provider: 'RAZORPAY',
    providerOrderId: 'order_1',
    amountPaise: 49900,
    currency: 'INR',
    method: 'UPI',
    status: 'PENDING',
    idempotencyKey: 'idem_1',
    lockVersion: 1,
  });
}

function webhookDomain() {
  return new PaymentWebhook({
    id: 2,
    publicId: 'webhook_2',
    provider: 'RAZORPAY',
    eventId: 'event_2',
    eventType: 'payment.captured',
    payloadHash: 'hash_2',
    processingStatus: 'PENDING',
    receivedAt: new Date('2026-01-01T00:00:00.000Z'),
  });
}

describe('PrismaPaymentRepository', () => {
  it('creates and updates payment aggregates', async () => {
    const { repository, payment } = fixture();
    const domain = paymentDomain();
    payment.create.mockResolvedValue(paymentRecord());
    payment.update.mockResolvedValue(paymentRecord({ providerPaymentId: 'pay_1', status: 'SUCCESS', lockVersion: 2 }));

    await expect(repository.create(domain)).resolves.toMatchObject({ publicId: 'payment_1', amountPaise: 49900 });
    domain.providerPaymentId = 'pay_1';
    domain.status = 'SUCCESS';
    await expect(repository.update(domain)).resolves.toMatchObject({ providerPaymentId: 'pay_1', status: 'SUCCESS', lockVersion: 2 });
    expect(payment.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: expect.objectContaining({ lockVersion: { increment: 1 } }),
    }));
  });

  it('maps every payment lookup and its missing result', async () => {
    const { repository, payment } = fixture();
    payment.findUnique
      .mockResolvedValueOnce(paymentRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(paymentRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(paymentRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(paymentRecord())
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(paymentRecord())
      .mockResolvedValueOnce(null);
    payment.findFirst.mockResolvedValueOnce(paymentRecord()).mockResolvedValueOnce(null);

    await expect(repository.findById(1)).resolves.toMatchObject({ id: 1 });
    await expect(repository.findById(999)).resolves.toBeNull();
    await expect(repository.findByPublicId('payment_1')).resolves.toMatchObject({ publicId: 'payment_1' });
    await expect(repository.findByPublicId('missing')).resolves.toBeNull();
    await expect(repository.findByProviderOrderId('order_1')).resolves.toMatchObject({ providerOrderId: 'order_1' });
    await expect(repository.findByProviderOrderId('missing')).resolves.toBeNull();
    await expect(repository.findByProviderPaymentId('pay_1')).resolves.toMatchObject({ id: 1 });
    await expect(repository.findByProviderPaymentId('missing')).resolves.toBeNull();
    await expect(repository.findByIdempotencyKey('idem_1')).resolves.toMatchObject({ idempotencyKey: 'idem_1' });
    await expect(repository.findByIdempotencyKey('missing')).resolves.toBeNull();
    await expect(repository.findByBookingId(10)).resolves.toMatchObject({ bookingId: 10 });
    await expect(repository.findByBookingId(999)).resolves.toBeNull();
  });

  it('creates, finds and updates webhook aggregates including a missing lookup', async () => {
    const { repository, paymentWebhook } = fixture();
    const domain = webhookDomain();
    paymentWebhook.create.mockResolvedValue(webhookRecord());
    paymentWebhook.findUnique.mockResolvedValueOnce(webhookRecord()).mockResolvedValueOnce(null);
    paymentWebhook.update.mockResolvedValue(webhookRecord({ processingStatus: 'PROCESSED', processedAt: new Date('2026-01-02T00:00:00.000Z') }));

    await expect(repository.saveWebhook(domain)).resolves.toMatchObject({ eventId: 'event_2' });
    await expect(repository.findWebhookByEventId('RAZORPAY', 'event_2')).resolves.toMatchObject({ eventId: 'event_2' });
    await expect(repository.findWebhookByEventId('RAZORPAY', 'missing')).resolves.toBeNull();
    domain.markProcessed();
    await expect(repository.updateWebhook(domain)).resolves.toMatchObject({ processingStatus: 'PROCESSED' });
  });
});
