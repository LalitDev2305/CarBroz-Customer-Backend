import { describe, expect, it } from 'vitest';
import { CorporateInvoice } from '../invoice/corporate/domain/CorporateInvoice.js';
import { PartnerPayout } from '../payout/domain/PartnerPayout.js';
import { Payment } from '../payment/domain/Payment.js';

const invoiceProps = (overrides: Record<string, unknown> = {}) => ({
  invoiceNumber: 'INV-1', corporateAccountId: 1,
  billingPeriodStart: new Date('2026-01-01'), billingPeriodEnd: new Date('2026-01-31'),
  subtotalPaise: 10000, totalAmountPaise: 11800, dueDate: new Date('2020-01-01'),
  ...overrides,
});

const calculation = { grossAmountPaise: 10000, commissionPercentage: 10, commissionPaise: 1000, tdsPercentage: 1, tdsPaise: 100, netPayoutPaise: 8900, appliedRules: [] };
const payoutProps = (overrides: Record<string, unknown> = {}) => ({
  bookingId: 1, partnerId: 2, grossAmountPaise: 10000, commissionPaise: 1000, tdsPaise: 100,
  netPayoutPaise: 8900, calculationJson: calculation, ...overrides,
});
const paymentProps = (overrides: Record<string, unknown> = {}) => ({
  bookingId: 1, customerId: 2, amountPaise: 1000, idempotencyKey: 'idem-1', ...overrides,
});

describe('Financial aggregate final closeout', () => {
  it('covers CorporateInvoice constructor defaults, validation and lifecycle branches', () => {
    expect(() => new CorporateInvoice(invoiceProps({ invoiceNumber: '' }) as any)).toThrow('invoiceNumber');
    expect(() => new CorporateInvoice(invoiceProps({ corporateAccountId: 0 }) as any)).toThrow('corporateAccountId');
    const invoice = new CorporateInvoice(invoiceProps() as any);
    expect(invoice).toMatchObject({ cgstPaise: 0n, sgstPaise: 0n, igstPaise: 0n, paidAmountPaise: 0n, status: 'DRAFT', lines: [] });
    invoice.issue();
    expect(invoice.status).toBe('ISSUED');
    expect(() => invoice.issue()).toThrow('Cannot issue');
    invoice.recordPayment(100);
    expect(invoice.status).toBe('PARTIALLY_PAID');
    invoice.markOverdue();
    expect(invoice.status).toBe('OVERDUE');

    const paid = new CorporateInvoice(invoiceProps({ status: 'ISSUED' }) as any);
    paid.recordPayment(11800);
    expect(paid.status).toBe('PAID');
    paid.markOverdue();
    expect(paid.status).toBe('PAID');

    const future = new CorporateInvoice(invoiceProps({ status: 'ISSUED', dueDate: new Date('2999-01-01') }) as any);
    future.markOverdue();
    expect(future.status).toBe('ISSUED');
    const zero = new CorporateInvoice(invoiceProps({ status: 'ISSUED' }) as any);
    zero.recordPayment(0);
    expect(zero.status).toBe('ISSUED');
  });

  it('covers PartnerPayout validation, defaults and lifecycle guards', () => {
    expect(() => new PartnerPayout(payoutProps({ bookingId: 0 }) as any)).toThrow('booking');
    expect(() => new PartnerPayout(payoutProps({ partnerId: 0 }) as any)).toThrow('partner');
    expect(() => new PartnerPayout(payoutProps({ netPayoutPaise: 8800 }) as any)).toThrow('net amount');
    expect(() => new PartnerPayout(payoutProps({ calculationJson: { ...calculation, tdsPaise: 200 } }) as any)).toThrow('calculation snapshot');
    const payout = new PartnerPayout(payoutProps() as any);
    expect(payout.status).toBe('SCHEDULED');
    expect(payout.paidAt).toBeNull();
    payout.approve();
    expect(payout.status).toBe('APPROVED');
    expect(() => payout.approve()).toThrow('Cannot approve');
    payout.markProcessing();
    expect(payout.status).toBe('PROCESSING');
    expect(() => payout.markProcessing()).toThrow('Cannot start processing');
    payout.markPaid('pay-1');
    expect(payout.status).toBe('PAID');
    const paidAt = payout.paidAt;
    payout.markPaid('pay-2');
    expect(payout.paidAt).toBe(paidAt);
    payout.markFailed('bank rejected');
    expect(payout).toMatchObject({ status: 'FAILED', failureReason: 'bank rejected' });
    const scheduled = new PartnerPayout(payoutProps() as any);
    scheduled.markProcessing();
    expect(scheduled.status).toBe('PROCESSING');
  });

  it('covers Payment validation, defaults, success/failure and refund branches', () => {
    expect(() => new Payment(paymentProps({ bookingId: 0 }) as any)).toThrow('booking');
    expect(() => new Payment(paymentProps({ customerId: 0 }) as any)).toThrow('customer');
    expect(() => new Payment(paymentProps({ idempotencyKey: '' }) as any)).toThrow('idempotency');
    expect(() => new Payment(paymentProps({ amountPaise: 0 }) as any)).toThrow('positive integer');
    const payment = new Payment(paymentProps() as any);
    expect(payment).toMatchObject({ provider: 'RAZORPAY', currency: 'INR', method: 'UPI', status: 'PENDING', lockVersion: 1 });
    expect(payment.attemptsJson).toEqual([]);
    expect(payment.refundsJson).toEqual([]);
    expect(payment.money.amountMinor).toBe(1000);
    payment.markFailed('DECLINED', 'Declined');
    expect(payment.status).toBe('FAILED');
    payment.markSuccess('payment-1', 'CARD' as any);
    expect(payment).toMatchObject({ status: 'SUCCESS', providerPaymentId: 'payment-1', method: 'CARD' });
    const attempts = payment.attemptsJson.length;
    payment.markSuccess('payment-2');
    expect(payment.attemptsJson).toHaveLength(attempts);
    payment.markFailed('LATE', 'ignored');
    expect(payment.status).toBe('SUCCESS');
    expect(() => new Payment(paymentProps() as any).markRefunded('r', 100, 'x')).toThrow('Only successful');
    expect(() => payment.markRefunded('r', 0, 'x')).toThrow('positive integer');
    expect(() => payment.markRefunded('r', 1001, 'x')).toThrow('exceed');
    payment.markRefunded('r', 500, 'partial');
    expect(payment.status).toBe('REFUNDED');
    payment.markFailed('LATE', 'ignored');
    expect(payment.status).toBe('REFUNDED');
  });
});
