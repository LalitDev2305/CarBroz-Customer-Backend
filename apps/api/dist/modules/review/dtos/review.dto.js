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
//# sourceMappingURL=review.dto.js.map