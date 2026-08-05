export interface ReviewSubmittedEvent {
  eventName: 'ReviewSubmitted';
  reviewPublicId: string;
  bookingId: number;
  customerId: number;
  partnerId: number;
  rating: number;
  timestamp: Date;
}

export interface ReviewModeratedEvent {
  eventName: 'ReviewModerated';
  reviewPublicId: string;
  partnerId: number;
  status: string;
  moderationReason?: string | null;
  timestamp: Date;
}

export interface PartnerRatingUpdatedEvent {
  eventName: 'PartnerRatingUpdated';
  partnerId: number;
  averageRating: number;
  totalReviews: number;
  timestamp: Date;
}

export interface CouponCreatedEvent {
  eventName: 'CouponCreated';
  couponPublicId: string;
  code: string;
  discountType: string;
  discountValue: number;
  timestamp: Date;
}

export interface CouponAppliedEvent {
  eventName: 'CouponApplied';
  couponId: number;
  userId: number;
  bookingId: number;
  discountAmountPaise: number;
  timestamp: Date;
}

export interface CouponExpiredEvent {
  eventName: 'CouponExpired';
  couponPublicId: string;
  code: string;
  timestamp: Date;
}
