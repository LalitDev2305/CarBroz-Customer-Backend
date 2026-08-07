import { Money } from '@carbroz/foundation-kernel';
export class Dispute {
    id;
    publicId;
    bookingId;
    raisedByActorId;
    raisedByActorType;
    disputeReason;
    description;
    requestedRefundAmount;
    refundedAmount;
    status;
    resolutionNotes;
    resolvedAt;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.bookingId)
            throw new Error('Dispute requires a bookingId');
        if (!props.raisedByActorId)
            throw new Error('Dispute requires raisedByActorId');
        if (!props.disputeReason)
            throw new Error('Dispute requires a disputeReason');
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
    resolveRefund(approvedRefundAmount, notes) {
        if (this.status !== 'OPEN' && this.status !== 'UNDER_REVIEW') {
            throw new Error(`Cannot resolve dispute in status ${this.status}`);
        }
        if (approvedRefundAmount.amountPaise > this.requestedRefundAmount.amountPaise) {
            throw new Error('Approved refund cannot exceed requested refund amount');
        }
        this.refundedAmount = approvedRefundAmount;
        this.status = 'RESOLVED_REFUNDED';
        this.resolutionNotes = notes;
        this.resolvedAt = new Date();
    }
    reject(notes) {
        if (this.status !== 'OPEN' && this.status !== 'UNDER_REVIEW') {
            throw new Error(`Cannot reject dispute in status ${this.status}`);
        }
        this.refundedAmount = Money.zero();
        this.status = 'RESOLVED_REJECTED';
        this.resolutionNotes = notes;
        this.resolvedAt = new Date();
    }
}
//# sourceMappingURL=Dispute.js.map