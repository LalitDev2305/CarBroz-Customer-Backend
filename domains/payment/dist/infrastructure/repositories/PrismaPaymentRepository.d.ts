import { PrismaClient } from '@prisma/client';
import { IPaymentRepository, Payment, PaymentWebhook } from '@carbroz/common';
export declare class PrismaPaymentRepository implements IPaymentRepository {
    private readonly prismaClient;
    private unitOfWorkPrisma;
    constructor(prismaClient: PrismaClient);
    private get prisma();
    private mapPaymentToDomain;
    private mapWebhookToDomain;
    create(payment: Payment): Promise<Payment>;
    findById(id: number): Promise<Payment | null>;
    findByPublicId(publicId: string): Promise<Payment | null>;
    findByBookingId(bookingId: number): Promise<Payment | null>;
    findByProviderOrderId(orderId: string): Promise<Payment | null>;
    findByProviderPaymentId(paymentId: string): Promise<Payment | null>;
    findByIdempotencyKey(key: string): Promise<Payment | null>;
    update(payment: Payment): Promise<Payment>;
    saveWebhook(webhook: PaymentWebhook): Promise<PaymentWebhook>;
    findWebhookByEventId(provider: string, eventId: string): Promise<PaymentWebhook | null>;
    updateWebhook(webhook: PaymentWebhook): Promise<PaymentWebhook>;
}
//# sourceMappingURL=PrismaPaymentRepository.d.ts.map