import crypto from 'node:crypto';
import { type IBookingRepository } from '@carbroz/domain-booking';
import { type IPaymentGatewayProvider } from '../ports/IPaymentGatewayProvider.js';
import { type IPaymentRepository } from '../../payment/domain/repositories/IPaymentRepository.js';
import { PaymentWebhook } from '../../payment/domain/PaymentWebhook.js';
import { type ITransactionProvider } from '@carbroz/foundation-kernel';
import { GenerateInvoiceUseCase } from '../invoice/GenerateInvoiceUseCase.js';

export interface ProcessWebhookInput {
  rawBodyBuffer: Buffer;
  signature: string;
  webhookSecret: string;
}

export class ProcessPaymentWebhookUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly paymentGatewayProvider: IPaymentGatewayProvider,
    private readonly generateInvoiceUseCase: GenerateInvoiceUseCase,
    private readonly transactionProvider: ITransactionProvider
  ) {}

  async execute(input: ProcessWebhookInput): Promise<{ processed: boolean; message: string }> {
    const isValid = this.paymentGatewayProvider.verifyWebhookSignature(
      input.rawBodyBuffer,
      input.signature,
      input.webhookSecret
    );

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const rawBodyString = input.rawBodyBuffer.toString('utf8');
    const parsedEvent = this.paymentGatewayProvider.parseWebhookEvent(rawBodyString);
    const payloadHash = crypto.createHash('sha256').update(rawBodyString).digest('hex');

    // Replay Protection Check
    const existingWebhook = await this.paymentRepository.findWebhookByEventId(
      parsedEvent.provider,
      parsedEvent.eventId
    );

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
        } else if (parsedEvent.eventType === 'payment.failed') {
          const payment = parsedEvent.providerOrderId
            ? await this.paymentRepository.findByProviderOrderId(parsedEvent.providerOrderId)
            : null;

          if (payment) {
            payment.markFailed(
              parsedEvent.failureCode || 'PAYMENT_FAILED',
              parsedEvent.failureReason || 'Payment failed at gateway'
            );
            await this.paymentRepository.update(payment);
          }
        }

        webhookRecord.markProcessed();
        await this.paymentRepository.updateWebhook(webhookRecord);

        return { processed: true, message: 'Webhook event processed successfully' };
      } catch (err: any) {
        webhookRecord.markFailed(err.message || 'Processing failed');
        await this.paymentRepository.updateWebhook(webhookRecord);
        throw err;
      }
    });
  }
}
