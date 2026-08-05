export class Review {
    id;
    publicId;
    bookingId;
    customerId;
    partnerId;
    serviceId;
    rating;
    comment;
    status;
    moderationReason;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.bookingId)
            throw new Error('Review must be associated with a bookingId');
        if (!props.customerId)
            throw new Error('Review must be associated with a customerId');
        if (!props.partnerId)
            throw new Error('Review must be associated with a partnerId');
        if (!props.serviceId)
            throw new Error('Review must be associated with a serviceId');
        if (props.rating < 1 || props.rating > 5 || !Number.isInteger(props.rating)) {
            throw new Error(`Review rating must be an integer between 1 and 5 (got ${props.rating})`);
        }
        this.id = props.id;
        this.publicId = props.publicId;
        this.bookingId = props.bookingId;
        this.customerId = props.customerId;
        this.partnerId = props.partnerId;
        this.serviceId = props.serviceId;
        this.rating = props.rating;
        this.comment = props.comment ?? null;
        this.status = props.status ?? 'PUBLISHED';
        this.moderationReason = props.moderationReason ?? null;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    moderate(newStatus, reason) {
        this.status = newStatus;
        if (reason) {
            this.moderationReason = reason;
        }
    }
}
//# sourceMappingURL=Review.js.map