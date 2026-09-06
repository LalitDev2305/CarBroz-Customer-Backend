import { Review } from '../Review.js';

/** PartnerRatingStats is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export interface PartnerRatingStats {
  averageRating: number;
  totalReviews: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}

/** IReviewRepository is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export interface IReviewRepository {
  create(review: Review): Promise<Review>;
  findById(id: number): Promise<Review | null>;
  findByPublicId(publicId: string): Promise<Review | null>;
  findByBookingId(bookingId: number): Promise<Review | null>;
  listByPartnerId(partnerId: number, limit?: number, offset?: number): Promise<Review[]>;
  update(review: Review): Promise<Review>;
  calculatePartnerRatingStats(partnerId: number): Promise<PartnerRatingStats>;
  updatePartnerProfileRatingStats(partnerId: number, stats: PartnerRatingStats): Promise<void>;
}
