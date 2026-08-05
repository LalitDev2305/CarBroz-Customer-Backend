export interface CouponUsageProps {
    id?: number;
    publicId?: string;
    couponId: number;
    userId: number;
    bookingId: number;
    discountAmountPaise: number;
    usedAt?: Date;
}
export declare class CouponUsage {
    id?: number;
    publicId?: string;
    couponId: number;
    userId: number;
    bookingId: number;
    discountAmountPaise: number;
    usedAt: Date;
    constructor(props: CouponUsageProps);
}
