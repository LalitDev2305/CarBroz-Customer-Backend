import { z } from 'zod';

export const adminResolveDisputeSchema = z.object({
  action: z.enum(['REFUND', 'REJECT']),
  approvedRefundPaise: z.number().int().nonnegative().optional(),
  resolutionNotes: z.string().min(5),
});
