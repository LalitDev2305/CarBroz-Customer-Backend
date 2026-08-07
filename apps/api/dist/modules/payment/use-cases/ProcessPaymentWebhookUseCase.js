import crypto from 'node:crypto';
import { PaymentWebhook, } from '@carbroz/foundation-kernel';
export class ProcessPaymentWebhookUseCase {
    paymentRepository;
    bookingRepository;
    paymentGatewayProvider;
    generateInvoiceUseCase;
    transactionProvider;
    constructor(paymentRepository, bookingRepository, paymentGatewayProvider, generateInvoiceUseCase, transactionProvider) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.paymentGatewayProvider = paymentGatewayProvider;
        this.generateInvoiceUseCase = generateInvoiceUseCase;
        this.transactionProvider = transactionProvider;
    }
    async execute(input) {
        const isValid = this.paymentGatewayProvider.verifyWebhookSignature(input.rawBodyBuffer, input.signature, input.webhookSecret);
        if (!isValid) {
            throw new Error('Invalid webhook signature');
        }
        const rawBodyString = input.rawBodyBuffer.toString('utf8');
        const parsedEvent = this.paymentGatewayProvider.parseWebhookEvent(rawBodyString);
        const payloadHash = crypto.createHash('sha256').update(rawBodyString).digest('hex');
        // Replay Protection Check
        const existingWebhook = await this.paymentRepository.findWebhookByEventId(parsedEvent.provider, parsedEvent.eventId);
        if (existingWebhook && existingWebhook.processingStatus === 'PROCESSED') {
            return { processed: true, message: 'Webhook event already processed (idempotent response)' };
        }
        const webhookRecord = existingWebhook || new PaymentWebhook({
            provider: parsedEvent.provider,
            eventId: parsedEvent.eventId,
            eventType: parsedEvent.eventType,
            payloadHash,
        });
        if (!existingWebhook) {
            await this.paymentRepository.saveWebhook(webhookRecord);
        }
        return await this.transactionProvider.runInTransaction(async () => {
            try {
                if (parsedEvent.eventType === 'payment.captured' || parsedEvent.eventType === 'order.paid') {
                    const payment = parsedEvent.providerOrderId
                        ? await this.paymentRepository.findByProviderOrderId(parsedEvent.providerOrderId)
                        : parsedEvent.providerPaymentId
                            ? await this.paymentRepository.findByProviderPaymentId(parsedEvent.providerPaymentId)
                            : null;
                    if (payment) {
                        payment.markSuccess(parsedEvent.providerPaymentId || `pay_${Date.now()}`);
                        await this.paymentRepository.update(payment);
                        const booking = await this.bookingRepository.findById(payment.bookingId);
                        if (booking && booking.status === 'CREATED') {
                            booking.confirm(payment.customerId);
                            await this.bookingRepository.update(booking);
                        }
                        // Issue Invoice
                        await this.generateInvoiceUseCase.execute(payment.bookingId);
                    }
                }
                else if (parsedEvent.eventType === 'payment.failed') {
                    const payment = parsedEvent.providerOrderId
                        ? await this.paymentRepository.findByProviderOrderId(parsedEvent.providerOrderId)
                        : null;
                    if (payment) {
                        payment.markFailed(parsedEvent.failureCode || 'PAYMENT_FAILED', parsedEvent.failureReason || 'Payment failed at gateway');
                        await this.paymentRepository.update(payment);
                    }
                }
                webhookRecord.markProcessed();
                await this.paymentRepository.updateWebhook(webhookRecord);
                return { processed: true, message: 'Webhook event processed successfully' };
            }
            catch (err) {
                webhookRecord.markFailed(err.message || 'Processing failed');
                await this.paymentRepository.updateWebhook(webhookRecord);
                throw err;
            }
        });
    }
}
//# sourceMappingURL=ProcessPaymentWebhookUseCase.js.map