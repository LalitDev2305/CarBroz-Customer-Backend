import crypto from 'node:crypto';
import type { IBookingRepository } from '@carbroz/domain-booking';
import { Money } from '@carbroz/foundation-kernel';
import { Payment } from '../payment/domain/Payment.js';
import { PaymentWebhook } from '../payment/domain/PaymentWebhook.js';
import type { IPaymentRepository } from '../payment/domain/repositories/IPaymentRepository.js';
import { Invoice, type InvoiceDocument } from '../invoice/domain/Invoice.js';
import type { IInvoiceRepository } from '../invoice/domain/repositories/IInvoiceRepository.js';
import { PartnerPayout, type PayoutCalculation } from '../payout/domain/PartnerPayout.js';
import type { IPartnerPayoutRepository } from '../payout/domain/repositories/IPartnerPayoutRepository.js';
import type { PayoutStatus } from '../payout/domain/PayoutStatus.js';

export interface PaymentOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId?: string;
}

export interface ParsedPaymentWebhookEvent {
  provider: string;
  eventId: string;
  eventType: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  failureCode?: string;
  failureReason?: string;
}

export interface IPaymentGatewayPort {
  createOrder(input: {
    bookingPublicId: string;
    amountPaise: number;
    currency: string;
    idempotencyKey: string;
  }): Promise<PaymentOrderResult>;
  verifyWebhookSignature(rawBodyBuffer: Buffer, signature: string, secret: string): boolean;
  parseWebhookEvent(rawBodyString: string): ParsedPaymentWebhookEvent;
}

export interface ITransactionPort {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export interface IFinancialTaxCalculator {
  calculateInvoiceTax(subtotal: Money): {
    cgst: Money;
    sgst: Money;
    igst: Money;
    totalTax: Money;
    totalPrice: Money;
  };
  calculatePartnerPayout(gross: Money): {
    grossAmount: Money;
    commissionPercentage: number;
    commission: Money;
    tdsPercentage: number;
    tds: Money;
    netPayout: Money;
    appliedRules: string[];
  };
}

export interface CreatePaymentOrderInput {
  bookingPublicId: string;
  customerId: number;
}

export class CreatePaymentOrderUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly paymentGatewayProvider: IPaymentGatewayPort,
  ) {}

  async execute(input: CreatePaymentOrderInput): Promise<{ payment: Payment; checkoutParams: PaymentOrderResult }> {
    const booking = await this.bookingRepository.findByPublicId(input.bookingPublicId);
    if (!booking || booking.customerId !== input.customerId) {
      throw new Error('Booking not found or unauthorized');
    }
    if (['CANCELLED', 'EXPIRED', 'COMPLETED'].includes(booking.status)) {
      throw new Error(`Cannot create payment for booking in status ${booking.status}`);
    }
    if (booking.expiryAt && new Date() > booking.expiryAt) {
      throw new Error('Booking slot hold has expired');
    }

    const existingPayment = await this.paymentRepository.findByBookingId(booking.id!);
    if (existingPayment?.status === 'SUCCESS') {
      throw new Error('Booking has already been successfully paid');
    }

    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`bk_${booking.id}_${booking.totalPricePaise}`)
      .digest('hex');

    if (existingPayment?.status === 'PENDING') {
      return {
        payment: existingPayment,
        checkoutParams: {
          providerOrderId: existingPayment.providerOrderId ?? '',
          amountPaise: existingPayment.amountPaise,
          currency: existingPayment.currency,
        },
      };
    }

    const orderResult = await this.paymentGatewayProvider.createOrder({
      bookingPublicId: booking.publicId!,
      amountPaise: booking.totalPricePaise,
      currency: 'INR',
      idempotencyKey,
    });

    const payment = await this.paymentRepository.create(new Payment({
      bookingId: booking.id!,
      customerId: input.customerId,
      provider: 'RAZORPAY',
      providerOrderId: orderResult.providerOrderId,
      amountPaise: booking.totalPricePaise,
      currency: 'INR',
      status: 'PENDING',
      idempotencyKey,
    }));

    return { payment, checkoutParams: orderResult };
  }
}

export class GetPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(publicId: string, customerId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findByPublicId(publicId);
    if (!payment || payment.customerId !== customerId) {
      throw new Error('Payment record not found or unauthorized');
    }
    return payment;
  }
}

export class GenerateInvoiceUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly taxCalculator: IFinancialTaxCalculator,
    private readonly sellerGstin = '',
  ) {}

  async execute(bookingId: number): Promise<Invoice> {
    const existing = await this.invoiceRepository.findByBookingId(bookingId);
    if (existing) return existing;

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    const invoiceNumber = await this.invoiceRepository.generateNextInvoiceNumber();
    const snapshots = booking.snapshots;
    const subtotal = Money.fromMinor(snapshots.pricing.subtotalPaise, 'INR');
    const tax = this.taxCalculator.calculateInvoiceTax(subtotal);

    const documentJson: InvoiceDocument = {
      invoiceNumber,
      bookingPublicId: booking.publicId!,
      customerName: `Customer #${booking.customerId}`,
      customerAddress: `${snapshots.address.addressLine1}, ${snapshots.address.city}, ${snapshots.address.state} - ${snapshots.address.postalCode}`,
      sellerGstin: this.sellerGstin || undefined,
      serviceName: snapshots.service.name,
      basePricePaise: snapshots.pricing.basePricePaise,
      addonsTotalPaise: snapshots.pricing.addonsTotalPaise,
      subtotalPaise: subtotal.amountMinor,
      cgstPaise: tax.cgst.amountMinor,
      sgstPaise: tax.sgst.amountMinor,
      igstPaise: tax.igst.amountMinor,
      totalTaxPaise: tax.totalTax.amountMinor,
      totalPricePaise: tax.totalPrice.amountMinor,
      currency: 'INR',
      issuedAt: new Date(),
    };

    return this.invoiceRepository.create(new Invoice({
      bookingId,
      invoiceNumber,
      amountPaise: tax.totalPrice.amountMinor,
      currency: 'INR',
      status: 'ISSUED',
      documentJson,
    }));
  }
}

export class GetInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}
  async execute(publicId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByPublicId(publicId);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }
}

export interface ProcessWebhookInput {
  rawBodyBuffer: Buffer;
  signature: string;
  webhookSecret: string;
}

export class ProcessPaymentWebhookUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly paymentGatewayProvider: IPaymentGatewayPort,
    private readonly generateInvoiceUseCase: GenerateInvoiceUseCase,
    private readonly transactionProvider: ITransactionPort,
  ) {}

  async execute(input: ProcessWebhookInput): Promise<{ processed: boolean; message: string }> {
    if (!this.paymentGatewayProvider.verifyWebhookSignature(input.rawBodyBuffer, input.signature, input.webhookSecret)) {
      throw new Error('Invalid webhook signature');
    }

    const raw = input.rawBodyBuffer.toString('utf8');
    const event = this.paymentGatewayProvider.parseWebhookEvent(raw);
    const payloadHash = crypto.createHash('sha256').update(raw).digest('hex');
    const existing = await this.paymentRepository.findWebhookByEventId(event.provider, event.eventId);
    if (existing?.processingStatus === 'PROCESSED') {
      return { processed: true, message: 'Webhook event already processed (idempotent response)' };
    }

    const webhook = existing ?? new PaymentWebhook({ provider: event.provider, eventId: event.eventId, eventType: event.eventType, payloadHash });
    if (!existing) await this.paymentRepository.saveWebhook(webhook);

    return this.transactionProvider.runInTransaction(async () => {
      try {
        if (event.eventType === 'payment.captured' || event.eventType === 'order.paid') {
          const payment = event.providerOrderId
            ? await this.paymentRepository.findByProviderOrderId(event.providerOrderId)
            : event.providerPaymentId
              ? await this.paymentRepository.findByProviderPaymentId(event.providerPaymentId)
              : null;
          if (payment) {
            payment.markSuccess(event.providerPaymentId ?? `pay_${Date.now()}`);
            await this.paymentRepository.update(payment);
            const booking = await this.bookingRepository.findById(payment.bookingId);
            if (booking?.status === 'CREATED') {
              booking.confirm(payment.customerId);
              await this.bookingRepository.update(booking);
            }
            await this.generateInvoiceUseCase.execute(payment.bookingId);
          }
        } else if (event.eventType === 'payment.failed' && event.providerOrderId) {
          const payment = await this.paymentRepository.findByProviderOrderId(event.providerOrderId);
          if (payment) {
            payment.markFailed(event.failureCode ?? 'PAYMENT_FAILED', event.failureReason ?? 'Payment failed at gateway');
            await this.paymentRepository.update(payment);
          }
        }
        webhook.markProcessed();
        await this.paymentRepository.updateWebhook(webhook);
        return { processed: true, message: 'Webhook event processed successfully' };
      } catch (error) {
        webhook.markFailed(error instanceof Error ? error.message : 'Processing failed');
        await this.paymentRepository.updateWebhook(webhook);
        throw error;
      }
    });
  }
}

export class CreatePayoutEligibilityUseCase {
  constructor(
    private readonly payoutRepository: IPartnerPayoutRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly taxCalculator: IFinancialTaxCalculator,
  ) {}

  async execute(bookingId: number): Promise<PartnerPayout> {
    const existing = await this.payoutRepository.findByBookingId(bookingId);
    if (existing) return existing;
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking || booking.status !== 'COMPLETED' || !booking.partnerId) {
      throw new Error('Payout eligibility requires a COMPLETED booking with an assigned partner');
    }

    const calculation = this.taxCalculator.calculatePartnerPayout(Money.fromMinor(booking.totalPricePaise, 'INR'));
    const calculationJson: PayoutCalculation = {
      grossAmountPaise: calculation.grossAmount.amountMinor,
      commissionPercentage: calculation.commissionPercentage,
      commissionPaise: calculation.commission.amountMinor,
      tdsPercentage: calculation.tdsPercentage,
      tdsPaise: calculation.tds.amountMinor,
      netPayoutPaise: calculation.netPayout.amountMinor,
      appliedRules: calculation.appliedRules,
    };

    return this.payoutRepository.create(new PartnerPayout({
      bookingId,
      partnerId: booking.partnerId,
      status: 'SCHEDULED',
      grossAmountPaise: calculation.grossAmount.amountMinor,
      commissionPaise: calculation.commission.amountMinor,
      tdsPaise: calculation.tds.amountMinor,
      netPayoutPaise: calculation.netPayout.amountMinor,
      calculationJson,
    }));
  }
}

export class ListPartnerPayoutsUseCase {
  constructor(private readonly payoutRepository: IPartnerPayoutRepository) {}
  execute(partnerId: number, status?: PayoutStatus): Promise<PartnerPayout[]> {
    return this.payoutRepository.listByPartnerId(partnerId, status);
  }
}

export interface MarkPayoutPaidInput { publicId: string; externalReference: string }
export class MarkPayoutPaidUseCase {
  constructor(private readonly payoutRepository: IPartnerPayoutRepository) {}
  async execute(input: MarkPayoutPaidInput): Promise<PartnerPayout> {
    if (!input.externalReference?.trim()) throw new Error('External reference is required to mark payout as paid');
    const payout = await this.payoutRepository.findByPublicId(input.publicId);
    if (!payout) throw new Error('Partner payout record not found');
    payout.markPaid(input.externalReference);
    return this.payoutRepository.update(payout);
  }
}

export class ProcessPayoutBatchUseCase {
  constructor(private readonly payoutRepository: IPartnerPayoutRepository) {}
  async execute(): Promise<number> {
    const payouts = await this.payoutRepository.listByStatus('SCHEDULED', 100);
    for (const payout of payouts) {
      payout.approve();
      payout.markProcessing();
      await this.payoutRepository.update(payout);
    }
    return payouts.length;
  }
}
