export class PartnerPayout {
    id;
    publicId;
    bookingId;
    partnerId;
    status;
    grossAmountPaise;
    commissionPaise;
    tdsPaise;
    netPayoutPaise;
    calculationJson;
    scheduledAt;
    paidAt;
    externalReference;
    failureReason;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.bookingId)
            throw new Error('Payout must be associated with a booking');
        if (!props.partnerId)
            throw new Error('Payout must be associated with a partner');
        this.id = props.id;
        this.publicId = props.publicId;
        this.bookingId = props.bookingId;
        this.partnerId = props.partnerId;
        this.status = props.status ?? 'SCHEDULED';
        this.grossAmountPaise = props.grossAmountPaise;
        this.commissionPaise = props.commissionPaise;
        this.tdsPaise = props.tdsPaise;
        this.netPayoutPaise = props.netPayoutPaise;
        this.calculationJson = props.calculationJson;
        this.scheduledAt = props.scheduledAt ?? new Date();
        this.paidAt = props.paidAt ?? null;
        this.externalReference = props.externalReference ?? null;
        this.failureReason = props.failureReason ?? null;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    approve() {
        if (this.status !== 'SCHEDULED') {
            throw new Error(`Cannot approve payout in status ${this.status}`);
        }
        this.status = 'APPROVED';
    }
    markProcessing() {
        if (this.status !== 'APPROVED' && this.status !== 'SCHEDULED') {
            throw new Error(`Cannot start processing payout in status ${this.status}`);
        }
        this.status = 'PROCESSING';
    }
    markPaid(externalReference) {
        if (this.status === 'PAID')
            return;
        this.status = 'PAID';
        this.paidAt = new Date();
        this.externalReference = externalReference;
    }
    markFailed(reason) {
        this.status = 'FAILED';
        this.failureReason = reason;
    }
}
//# sourceMappingURL=PartnerPayout.js.map