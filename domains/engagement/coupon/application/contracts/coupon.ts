/**
 * Transport-neutral application input contracts derived from coupon.dto.ts.
 * Zod remains at the API boundary; bounded-context application services depend only on these types.
 */
export type CreateCouponDto = { code: string; discountType: "PERCENTAGE" | "FIXED_AMOUNT"; discountValue: number; validFrom: string; validUntil: string; description?: string | undefined; maxDiscountPaise?: number | undefined; minBookingAmountPaise?: number | undefined; usageLimit?: number | undefined; perUserLimit?: number | undefined; };
/** UpdateCouponDto is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export type UpdateCouponDto = { description?: string | undefined; discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | undefined; discountValue?: number | undefined; maxDiscountPaise?: number | null | undefined; minBookingAmountPaise?: number | undefined; usageLimit?: number | null | undefined; perUserLimit?: number | undefined; validFrom?: string | undefined; validUntil?: string | undefined; isActive?: boolean | undefined; };
/** ValidateCouponDto is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export type ValidateCouponDto = { code: string; bookingAmountPaise: number; };
/** ApplyCouponDto is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export type ApplyCouponDto = { code: string; bookingPublicId: string; };
