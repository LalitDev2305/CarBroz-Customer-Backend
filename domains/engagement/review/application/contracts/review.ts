/**
 * Transport-neutral application input contracts derived from review.dto.ts.
 * Zod remains at the API boundary; bounded-context application services depend only on these types.
 */
export type SubmitReviewDto = { bookingPublicId: string; rating: number; comment?: string | undefined; };
/** ModerateReviewDto is an exported domains/engagement contract/implementation; see the owning README for lifecycle and extension rules. */
export type ModerateReviewDto = { reviewPublicId: string; status: "PUBLISHED" | "FLAGGED" | "REJECTED"; moderationReason?: string | undefined; };
