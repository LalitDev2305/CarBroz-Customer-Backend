import { DiscountType } from '../enums/DiscountType.js';

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

export class Coupon {
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

  constructor(props: CouponProps) {
    if (!props.code) throw new Error('Coupon code is required');
    if (props.discountValue <= 0 || !Number.isInteger(props.discountValue)) {
      throw new Error(`Discount value must be a positive integer (got ${props.discountValue})`);
    }
    if (props.discountType === 'PERCENTAGE' && props.discountValue > 100) {
      throw new Error(`Percentage discount cannot exceed 100% (got ${props.discountValue})`);
    }
    if (props.validFrom >= props.validUntil) {
      throw new Error('validFrom date must be earlier than validUntil date');
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.code = props.code.trim().toUpperCase();
    this.description = props.description ?? null;
    this.discountType = props.discountType;
    this.discountValue = props.discountValue;
    this.maxDiscountPaise = props.maxDiscountPaise ?? null;
    this.minBookingAmountPaise = props.minBookingAmountPaise ?? 0;
    this.usageLimit = props.usageLimit ?? null;
    this.perUserLimit = props.perUserLimit ?? 1;
    this.currentUsageCount = props.currentUsageCount ?? 0;
    this.validFrom = props.validFrom;
    this.validUntil = props.validUntil;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isValidAt(now = new Date()): boolean {
    if (!this.isActive) return false;
    if (now < this.validFrom || now > this.validUntil) return false;
    if (this.usageLimit !== null && this.currentUsageCount >= this.usageLimit) return false;
    return true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  incrementUsage(): void {
    this.currentUsageCount += 1;
  }
}
