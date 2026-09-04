import type { Payment } from '../Payment.js';
import type { PaymentWebhook } from '../PaymentWebhook.js';

export interface IPaymentRepository {
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
