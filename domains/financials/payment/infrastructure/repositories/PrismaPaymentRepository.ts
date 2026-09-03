import { PrismaClient } from '@prisma/client';
import { IPaymentRepository, Payment, PaymentMethod, PaymentStatus, PaymentWebhook } from '@carbroz/common';

export class PrismaPaymentRepository implements IPaymentRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  private mapPaymentToDomain(record: any): Payment {
    return new Payment({
      id: record.id,
      publicId: record.publicId,
      bookingId: record.bookingId,
      customerId: record.customerId,
      provider: record.provider,
      providerOrderId: record.providerOrderId,
      providerPaymentId: record.providerPaymentId,
      amountPaise: record.amountPaise,
      currency: record.currency,
      method: record.method as PaymentMethod,
      status: record.status as PaymentStatus,
      idempotencyKey: record.idempotencyKey,
      attemptsJson: record.attemptsJson as any,
      refundsJson: record.refundsJson as any,
      failureCode: record.failureCode,
      failureReason: record.failureReason,
      paidAt: record.paidAt,
      failedAt: record.failedAt,
      refundedAt: record.refundedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      lockVersion: record.lockVersion,
    });
  }

  private mapWebhookToDomain(record: any): PaymentWebhook {
    return new PaymentWebhook({
      id: record.id,
      publicId: record.publicId,
      provider: record.provider,
      eventId: record.eventId,
      eventType: record.eventType,
      payloadHash: record.payloadHash,
      processingStatus: record.processingStatus,
      receivedAt: record.receivedAt,
      processedAt: record.processedAt,
      failureReason: record.failureReason,
      retryCount: record.retryCount,
    });
  }

  async create(payment: Payment): Promise<Payment> {
    const record = await (this.prisma as any).payment.create({
      data: {
        bookingId: payment.bookingId,
        customerId: payment.customerId,
        provider: payment.provider,
        providerOrderId: payment.providerOrderId,
        providerPaymentId: payment.providerPaymentId,
        amountPaise: payment.amountPaise,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        idempotencyKey: payment.idempotencyKey,
        attemptsJson: payment.attemptsJson as any,
        refundsJson: payment.refundsJson as any,
        failureCode: payment.failureCode,
        failureReason: payment.failureReason,
        paidAt: payment.paidAt,
        failedAt: payment.failedAt,
        refundedAt: payment.refundedAt,
      },
    });
    return this.mapPaymentToDomain(record);
  }

  async findById(id: number): Promise<Payment | null> {
    const record = await (this.prisma as any).payment.findUnique({ where: { id } });
    return record ? this.mapPaymentToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<Payment | null> {
    const record = await (this.prisma as any).payment.findUnique({ where: { publicId } });
    return record ? this.mapPaymentToDomain(record) : null;
  }

  async findByBookingId(bookingId: number): Promise<Payment | null> {
    const record = await (this.prisma as any).payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.mapPaymentToDomain(record) : null;
  }

  async findByProviderOrderId(orderId: string): Promise<Payment | null> {
    const record = await (this.prisma as any).payment.findUnique({ where: { providerOrderId: orderId } });
    return record ? this.mapPaymentToDomain(record) : null;
  }

  async findByProviderPaymentId(paymentId: string): Promise<Payment | null> {
    const record = await (this.prisma as any).payment.findUnique({ where: { providerPaymentId: paymentId } });
    return record ? this.mapPaymentToDomain(record) : null;
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    const record = await (this.prisma as any).payment.findUnique({ where: { idempotencyKey: key } });
    return record ? this.mapPaymentToDomain(record) : null;
  }

  async update(payment: Payment): Promise<Payment> {
    const record = await (this.prisma as any).payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: payment.providerPaymentId,
        method: payment.method,
        status: payment.status,
        attemptsJson: payment.attemptsJson as any,
        refundsJson: payment.refundsJson as any,
        failureCode: payment.failureCode,
        failureReason: payment.failureReason,
        paidAt: payment.paidAt,
        failedAt: payment.failedAt,
        refundedAt: payment.refundedAt,
        lockVersion: { increment: 1 },
      },
    });
    return this.mapPaymentToDomain(record);
  }

  async saveWebhook(webhook: PaymentWebhook): Promise<PaymentWebhook> {
    const record = await (this.prisma as any).paymentWebhook.create({
      data: {
        provider: webhook.provider,
        eventId: webhook.eventId,
        eventType: webhook.eventType,
        payloadHash: webhook.payloadHash,
        processingStatus: webhook.processingStatus,
        receivedAt: webhook.receivedAt,
        processedAt: webhook.processedAt,
        failureReason: webhook.failureReason,
        retryCount: webhook.retryCount,
      },
    });
    return this.mapWebhookToDomain(record);
  }

  async findWebhookByEventId(provider: string, eventId: string): Promise<PaymentWebhook | null> {
    const record = await (this.prisma as any).paymentWebhook.findUnique({
      where: { provider_eventId: { provider, eventId } },
    });
    return record ? this.mapWebhookToDomain(record) : null;
  }

  async updateWebhook(webhook: PaymentWebhook): Promise<PaymentWebhook> {
    const record = await (this.prisma as any).paymentWebhook.update({
      where: { id: webhook.id },
      data: {
        processingStatus: webhook.processingStatus,
        processedAt: webhook.processedAt,
        failureReason: webhook.failureReason,
        retryCount: webhook.retryCount,
      },
    });
    return this.mapWebhookToDomain(record);
  }
}
