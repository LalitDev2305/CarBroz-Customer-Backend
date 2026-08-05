import { PaymentStatus } from './PaymentStatus.js';
import { PaymentMethod } from './PaymentMethod.js';
import { Money } from '@carbroz/shared-kernel';
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
export declare class Payment {
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
    constructor(props: PaymentProps);
    get money(): Money;
    markSuccess(providerPaymentId: string, method?: PaymentMethod): void;
    markFailed(code: string, reason: string): void;
    markRefunded(providerRefundId: string, amountPaise: number, reason: string): void;
}
//# sourceMappingURL=Payment.d.ts.map