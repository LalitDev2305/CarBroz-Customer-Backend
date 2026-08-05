import { DiscountType } from './DiscountType.js';
export interface CouponProps {
    id?: number;
    publicId?: string;
    code: string;
    description?: string | null;
    discountType: DiscountType;
    discountValue: number;
    maxDiscountPaise?: number | null;
    minBookingAmountPaise?: number;
    usageLimit?: number | null;
    perUserLimit?: number;
    currentUsageCount?: number;
    validFrom: Date;
    validUntil: Date;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class Coupon {
    id?: number;
    publicId?: string;
    code: string;
    description: string | null;
    discountType: DiscountType;
    discountValue: number;
    maxDiscountPaise: number | null;
    minBookingAmountPaise: number;
    usageLimit: number | null;
    perUserLimit: number;
    currentUsageCount: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(props: CouponProps);
    isValidAt(now?: Date): boolean;
    deactivate(): void;
    incrementUsage(): void;
}
