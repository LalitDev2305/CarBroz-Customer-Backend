import { PaymentStatus } from '../enums/PaymentStatus.js';
import { PaymentMethod } from '../enums/PaymentMethod.js';
import { AggregateRoot } from '@carbroz/foundation-kernel';
import { Money } from '@carbroz/foundation-kernel';


export interface PaymentAttempt {
  attemptId: string;
  providerPaymentId?: string;
  method?: string;
  timestamp: Date | string;
  status: string;
  failureCode?: string;
  failureReason?: string;
}

export interface PaymentRefund {
  refundId: string;
  providerRefundId?: string;
  amountPaise: number;
  reason: string;
  timestamp: Date | string;
  status: string;
}

export interface PaymentProps {
  id?: number;
  publicId?: string;
  bookingId: number;
  customerId: number;
  provider?: string;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  amountPaise: number;
  currency?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  idempotencyKey: string;
  attemptsJson?: PaymentAttempt[];
  refundsJson?: PaymentRefund[];
  failureCode?: string | null;
  failureReason?: string | null;
  paidAt?: Date | null;
  failedAt?: Date | null;
  refundedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  lockVersion?: number;
}

export class Payment {
  id?: number;
  publicId?: string;
  bookingId: number;
  customerId: number;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  amountPaise: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  idempotencyKey: string;
  attemptsJson: PaymentAttempt[];
  refundsJson: PaymentRefund[];
  failureCode: string | null;
  failureReason: string | null;
  paidAt: Date | null;
  failedAt: Date | null;
  refundedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  lockVersion: number;

  constructor(props: PaymentProps) {
    if (!props.bookingId) throw new Error('Payment must be associated with a booking');
    if (!props.customerId) throw new Error('Payment must be associated with a customer');
    if (!props.idempotencyKey) throw new Error('Payment idempotency key is required');

    const validatedMoney = Money.fromPaise(props.amountPaise, props.currency ?? 'INR');
    if (validatedMoney.amountPaise <= 0) {
      throw new Error('Payment amount must be a positive integer in paise');
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.customerId = props.customerId;
    this.provider = props.provider ?? 'RAZORPAY';
    this.providerOrderId = props.providerOrderId ?? null;
    this.providerPaymentId = props.providerPaymentId ?? null;
    this.amountPaise = validatedMoney.amountPaise;
    this.currency = validatedMoney.currency;
    this.method = props.method ?? 'UPI';
    this.status = props.status ?? 'PENDING';
    this.idempotencyKey = props.idempotencyKey;
    this.attemptsJson = props.attemptsJson ?? [];
    this.refundsJson = props.refundsJson ?? [];
    this.failureCode = props.failureCode ?? null;
    this.failureReason = props.failureReason ?? null;
    this.paidAt = props.paidAt ?? null;
    this.failedAt = props.failedAt ?? null;
    this.refundedAt = props.refundedAt ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lockVersion = props.lockVersion ?? 1;
  }

  get money(): Money {
    return Money.fromPaise(this.amountPaise, this.currency);
  }

  markSuccess(providerPaymentId: string, method?: PaymentMethod): void {
    if (this.status === 'SUCCESS') return; // Idempotent
    this.status = 'SUCCESS';
    this.providerPaymentId = providerPaymentId;
    if (method) this.method = method;
    this.paidAt = new Date();
    this.attemptsJson.push({
      attemptId: `att_${Date.now()}`,
      providerPaymentId,
      method: this.method,
      timestamp: new Date(),
      status: 'SUCCESS',
    });
  }

  markFailed(code: string, reason: string): void {
    if (this.status === 'SUCCESS' || this.status === 'REFUNDED') return;
    this.status = 'FAILED';
    this.failureCode = code;
    this.failureReason = reason;
    this.failedAt = new Date();
    this.attemptsJson.push({
      attemptId: `att_${Date.now()}`,
      timestamp: new Date(),
      status: 'FAILED',
      failureCode: code,
      failureReason: reason,
    });
  }

  markRefunded(providerRefundId: string, amountPaise: number, reason: string): void {
    if (this.status !== 'SUCCESS') {
      throw new Error('Only successful payments can be refunded');
    }
    this.status = 'REFUNDED';
    this.refundedAt = new Date();
    this.refundsJson.push({
      refundId: `ref_${Date.now()}`,
      providerRefundId,
      amountPaise,
      reason,
      timestamp: new Date(),
      status: 'REFUNDED',
    });
  }
}
