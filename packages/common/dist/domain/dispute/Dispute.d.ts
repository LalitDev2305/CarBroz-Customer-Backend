import { Money } from '../value-objects/Money.js';
import { DisputeStatus } from './DisputeStatus.js';
import { DisputeReason } from './DisputeReason.js';
export interface DisputeProps {
    id?: number;
    publicId?: string;
    bookingId: number;
    raisedByActorId: number;
    raisedByActorType: 'CUSTOMER' | 'PARTNER';
    disputeReason: DisputeReason | string;
    description?: string | null;
    requestedRefundAmount: Money;
    refundedAmount?: Money;
    status?: DisputeStatus;
    resolutionNotes?: string | null;
    resolvedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Dispute {
    id?: number;
    publicId?: string;
    bookingId: number;
    raisedByActorId: number;
    raisedByActorType: 'CUSTOMER' | 'PARTNER';
    disputeReason: string;
    description: string | null;
    requestedRefundAmount: Money;
    refundedAmount: Money;
    status: DisputeStatus;
    resolutionNotes: string | null;
    resolvedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(props: DisputeProps);
    resolveRefund(approvedRefundAmount: Money, notes: string): void;
    reject(notes: string): void;
}
