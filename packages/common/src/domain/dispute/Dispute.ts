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

export class Dispute {
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

  constructor(props: DisputeProps) {
    if (!props.bookingId) throw new Error('Dispute requires a bookingId');
    if (!props.raisedByActorId) throw new Error('Dispute requires raisedByActorId');
    if (!props.disputeReason) throw new Error('Dispute requires a disputeReason');

    this.id = props.id;
    this.publicId = props.publicId;
    this.bookingId = props.bookingId;
    this.raisedByActorId = props.raisedByActorId;
    this.raisedByActorType = props.raisedByActorType;
    this.disputeReason = props.disputeReason;
    this.description = props.description ?? null;
    this.requestedRefundAmount = props.requestedRefundAmount;
    this.refundedAmount = props.refundedAmount ?? Money.zero();
    this.status = props.status ?? 'OPEN';
    this.resolutionNotes = props.resolutionNotes ?? null;
    this.resolvedAt = props.resolvedAt ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public resolveRefund(approvedRefundAmount: Money, notes: string): void {
    if (this.status !== 'OPEN' && this.status !== 'UNDER_REVIEW') {
      throw new Error(`Cannot resolve dispute in status ${this.status}`);
    }
    if (approvedRefundAmount.amountMinor > this.requestedRefundAmount.amountMinor) {
      throw new Error('Approved refund cannot exceed requested refund amount');
    }
    this.refundedAmount = approvedRefundAmount;
    this.status = 'RESOLVED_REFUNDED';
    this.resolutionNotes = notes;
    this.resolvedAt = new Date();
  }

  public reject(notes: string): void {
    if (this.status !== 'OPEN' && this.status !== 'UNDER_REVIEW') {
      throw new Error(`Cannot reject dispute in status ${this.status}`);
    }
    this.refundedAmount = Money.zero();
    this.status = 'RESOLVED_REJECTED';
    this.resolutionNotes = notes;
    this.resolvedAt = new Date();
  }
}
