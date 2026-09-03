import { z } from 'zod';

export const submitReviewSchema = z.object({
  bookingPublicId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type SubmitReviewDto = z.infer<typeof submitReviewSchema>;
