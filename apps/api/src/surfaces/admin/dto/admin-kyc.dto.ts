import { KycDocumentStatus } from '@carbroz/domain-partner';
import { z } from 'zod';


export const ReviewKycDocumentSchema = z.object({
  status: z.enum([KycDocumentStatus.APPROVED, KycDocumentStatus.REJECTED]),
  rejectionReason: z.string().optional(),
}).refine(data => {
  if (data.status === KycDocumentStatus.REJECTED && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: "Rejection reason is required when status is REJECTED",
  path: ["rejectionReason"]
});

/** ReviewKycDocumentDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type ReviewKycDocumentDto = z.infer<typeof ReviewKycDocumentSchema>;
