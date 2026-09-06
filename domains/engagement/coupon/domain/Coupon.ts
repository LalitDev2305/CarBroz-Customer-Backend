import { DomainError, systemClock } from "@carbroz/foundation-kernel";
import { DiscountType } from "./DiscountType.js";

/** CouponProps is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
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

/** Coupon is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
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
    if (!props.code) throw new DomainError("Coupon code is required");
    if (props.discountValue <= 0 || !Number.isInteger(props.discountValue)) {
      throw new DomainError(
        `Discount value must be a positive integer (got ${props.discountValue})`,
      );
    }
    if (props.discountType === "PERCENTAGE" && props.discountValue > 100) {
      throw new DomainError(
        `Percentage discount cannot exceed 100% (got ${props.discountValue})`,
      );
    }
    if (props.validFrom >= props.validUntil) {
      throw new DomainError(
        "validFrom date must be earlier than validUntil date",
      );
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

  isValidAt(now = systemClock.now()): boolean {
    if (!this.isActive) return false;
    if (now < this.validFrom || now > this.validUntil) return false;
    if (this.usageLimit !== null && this.currentUsageCount >= this.usageLimit)
      return false;
    return true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  incrementUsage(): void {
    this.currentUsageCount += 1;
  }
}
