import { z } from 'zod';

export const raiseDisputeSchema = z.object({
  bookingPublicId: z.string().uuid(),
  disputeReason: z.string().min(3),
  description: z.string().optional(),
  requestedRefundPaise: z.number().int().nonnegative(),
});
