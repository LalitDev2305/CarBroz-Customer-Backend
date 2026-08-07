export class CouponUsage {
    id;
    publicId;
    couponId;
    userId;
    bookingId;
    discountAmountPaise;
    usedAt;
    constructor(props) {
        if (!props.couponId)
            throw new Error('CouponUsage must be associated with a couponId');
        if (!props.userId)
            throw new Error('CouponUsage must be associated with a userId');
        if (!props.bookingId)
            throw new Error('CouponUsage must be associated with a bookingId');
        if (props.discountAmountPaise < 0 || !Number.isInteger(props.discountAmountPaise)) {
            throw new Error(`Discount amount must be a non-negative integer in paise (got ${props.discountAmountPaise})`);
        }
        this.id = props.id;
        this.publicId = props.publicId;
        this.couponId = props.couponId;
        this.userId = props.userId;
        this.bookingId = props.bookingId;
        this.discountAmountPaise = props.discountAmountPaise;
        this.usedAt = props.usedAt ?? new Date();
    }
}
//# sourceMappingURL=CouponUsage.js.map