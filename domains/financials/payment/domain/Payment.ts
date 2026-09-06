import { DomainError, systemClock } from "@carbroz/foundation-kernel";
import { PaymentStatus } from "./PaymentStatus.js";
import { PaymentMethod } from "./PaymentMethod.js";
import { Money } from "@carbroz/foundation-kernel";

/** PaymentAttempt is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PaymentAttempt {
  attemptId: string;
  providerPaymentId?: string;
  method?: string;
  timestamp: Date | string;
  status: string;
  failureCode?: string;
  failureReason?: string;
}

/** PaymentRefund is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PaymentRefund {
  refundId: string;
  providerRefundId?: string;
  amountPaise: number;
  reason: string;
  timestamp: Date | string;
  status: string;
}

/** PaymentProps is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
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

/** Payment is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
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
    if (!props.bookingId)
      throw new DomainError("Payment must be associated with a booking");
    if (!props.customerId)
      throw new DomainError("Payment must be associated with a customer");
    if (!props.idempotencyKey)
      throw new DomainError("Payment idempotency key is required");

    const validatedMoney = Money.fromMinor(
      props.amountPaise,
      props.currency ?? "INR",
    );
    if (validatedMoney.amountMinor <= 0) {
      throw new DomainError(
        "Payment amount must be a positive integer in minor units",
      );
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.customerId = props.customerId;
    this.provider = props.provider ?? "RAZORPAY";
    this.providerOrderId = props.providerOrderId ?? null;
    this.providerPaymentId = props.providerPaymentId ?? null;
    this.amountPaise = validatedMoney.amountMinor;
    this.currency = validatedMoney.currency;
    this.method = props.method ?? "UPI";
    this.status = props.status ?? "PENDING";
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
    return Money.fromMinor(this.amountPaise, this.currency);
  }

  markSuccess(providerPaymentId: string, method?: PaymentMethod): void {
    if (this.status === "SUCCESS") return;
    this.status = "SUCCESS";
    this.providerPaymentId = providerPaymentId;
    if (method) this.method = method;
    this.paidAt = systemClock.now();
    this.attemptsJson.push({
      attemptId: `att_${systemClock.now().getTime()}`,
      providerPaymentId,
      method: this.method,
      timestamp: systemClock.now(),
      status: "SUCCESS",
    });
  }

  markFailed(code: string, reason: string): void {
    if (this.status === "SUCCESS" || this.status === "REFUNDED") return;
    this.status = "FAILED";
    this.failureCode = code;
    this.failureReason = reason;
    this.failedAt = systemClock.now();
    this.attemptsJson.push({
      attemptId: `att_${systemClock.now().getTime()}`,
      timestamp: systemClock.now(),
      status: "FAILED",
      failureCode: code,
      failureReason: reason,
    });
  }

  markRefunded(
    providerRefundId: string,
    amountPaise: number,
    reason: string,
  ): void {
    if (this.status !== "SUCCESS") {
      throw new DomainError("Only successful payments can be refunded");
    }

    const refund = Money.fromMinor(amountPaise, this.currency);
    if (refund.amountMinor <= 0) {
      throw new DomainError(
        "Refund amount must be a positive integer in minor units",
      );
    }
    if (refund.greaterThan(this.money)) {
      throw new DomainError("Refund amount cannot exceed the payment amount");
    }

    this.status = "REFUNDED";
    this.refundedAt = systemClock.now();
    this.refundsJson.push({
      refundId: `ref_${systemClock.now().getTime()}`,
      providerRefundId,
      amountPaise: refund.amountMinor,
      reason,
      timestamp: systemClock.now(),
      status: "REFUNDED",
    });
  }
}
