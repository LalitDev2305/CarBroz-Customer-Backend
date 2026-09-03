import { z } from 'zod';

export const adminModerateReviewSchema = z.object({
  status: z.enum(['PUBLISHED', 'FLAGGED', 'REJECTED']),
  moderationReason: z.string().optional(),
});
