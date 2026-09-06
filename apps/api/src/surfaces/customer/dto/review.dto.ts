import { z } from 'zod';

export const submitReviewSchema = z.object({
  bookingPublicId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const moderateReviewSchema = z.object({
  reviewPublicId: z.string().uuid(),
  status: z.enum(['PUBLISHED', 'FLAGGED', 'REJECTED']),
  moderationReason: z.string().optional(),
});

/** SubmitReviewDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type SubmitReviewDto = z.infer<typeof submitReviewSchema>;
/** ModerateReviewDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type ModerateReviewDto = z.infer<typeof moderateReviewSchema>;
