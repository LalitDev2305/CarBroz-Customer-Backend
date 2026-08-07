import { Payment, PaymentWebhook } from '@carbroz/foundation-kernel';
export class PrismaPaymentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapPaymentToDomain(record) {
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
            method: record.method,
            status: record.status,
            idempotencyKey: record.idempotencyKey,
            attemptsJson: record.attemptsJson,
            refundsJson: record.refundsJson,
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
    mapWebhookToDomain(record) {
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
    async create(payment) {
        const record = await this.prisma.payment.create({
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
                attemptsJson: payment.attemptsJson,
                refundsJson: payment.refundsJson,
                failureCode: payment.failureCode,
                failureReason: payment.failureReason,
                paidAt: payment.paidAt,
                failedAt: payment.failedAt,
                refundedAt: payment.refundedAt,
            },
        });
        return this.mapPaymentToDomain(record);
    }
    async findById(id) {
        const record = await this.prisma.payment.findUnique({ where: { id } });
        return record ? this.mapPaymentToDomain(record) : null;
    }
    async findByPublicId(publicId) {
        const record = await this.prisma.payment.findUnique({ where: { publicId } });
        return record ? this.mapPaymentToDomain(record) : null;
    }
    async findByBookingId(bookingId) {
        const record = await this.prisma.payment.findFirst({
            where: { bookingId },
            orderBy: { createdAt: 'desc' },
        });
        return record ? this.mapPaymentToDomain(record) : null;
    }
    async findByProviderOrderId(orderId) {
        const record = await this.prisma.payment.findUnique({ where: { providerOrderId: orderId } });
        return record ? this.mapPaymentToDomain(record) : null;
    }
    async findByProviderPaymentId(paymentId) {
        const record = await this.prisma.payment.findUnique({ where: { providerPaymentId: paymentId } });
        return record ? this.mapPaymentToDomain(record) : null;
    }
    async findByIdempotencyKey(key) {
        const record = await this.prisma.payment.findUnique({ where: { idempotencyKey: key } });
        return record ? this.mapPaymentToDomain(record) : null;
    }
    async update(payment) {
        const record = await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                providerPaymentId: payment.providerPaymentId,
                method: payment.method,
                status: payment.status,
                attemptsJson: payment.attemptsJson,
                refundsJson: payment.refundsJson,
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
    async saveWebhook(webhook) {
        const record = await this.prisma.paymentWebhook.create({
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
    async findWebhookByEventId(provider, eventId) {
        const record = await this.prisma.paymentWebhook.findUnique({
            where: { provider_eventId: { provider, eventId } },
        });
        return record ? this.mapWebhookToDomain(record) : null;
    }
    async updateWebhook(webhook) {
        const record = await this.prisma.paymentWebhook.update({
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
//# sourceMappingURL=PrismaPaymentRepository.js.map