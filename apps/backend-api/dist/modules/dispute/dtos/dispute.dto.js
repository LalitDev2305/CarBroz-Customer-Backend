import { z } from 'zod';
export const raiseDisputeSchema = z.object({
    bookingPublicId: z.string().uuid(),
    disputeReason: z.string().min(3),
    description: z.string().optional(),
    requestedRefundPaise: z.number().int().nonnegative(),
});
export const resolveDisputeSchema = z.object({
    action: z.enum(['REFUND', 'REJECT']),
    approvedRefundPaise: z.number().int().nonnegative().optional(),
    resolutionNotes: z.string().min(5),
});
//# sourceMappingURL=dispute.dto.js.map