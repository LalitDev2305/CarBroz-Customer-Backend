import { DomainError, systemClock } from "@carbroz/foundation-kernel";
/** CouponUsageProps is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export interface CouponUsageProps {
  id?: number;
  publicId?: string;
  couponId: number;
  userId: number;
  bookingId: number;
  discountAmountPaise: number;
  usedAt?: Date;
}

/** CouponUsage is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export class CouponUsage {
  id?: number;
  publicId?: string;
  couponId: number;
  userId: number;
  bookingId: number;
  discountAmountPaise: number;
  usedAt: Date;

  constructor(props: CouponUsageProps) {
    if (!props.couponId)
      throw new DomainError("CouponUsage must be associated with a couponId");
    if (!props.userId)
      throw new DomainError("CouponUsage must be associated with a userId");
    if (!props.bookingId)
      throw new DomainError("CouponUsage must be associated with a bookingId");
    if (
      props.discountAmountPaise < 0 ||
      !Number.isInteger(props.discountAmountPaise)
    ) {
      throw new DomainError(
        `Discount amount must be a non-negative integer in paise (got ${props.discountAmountPaise})`,
      );
    }

    this.id = props.id;
    this.publicId = props.publicId;
    this.couponId = props.couponId;
    this.userId = props.userId;
    this.bookingId = props.bookingId;
    this.discountAmountPaise = props.discountAmountPaise;
    this.usedAt = props.usedAt ?? systemClock.now();
  }
}
