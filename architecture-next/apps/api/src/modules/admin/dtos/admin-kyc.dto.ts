import { z } from 'zod';
import { KycDocumentStatus } from '@carbroz/common';

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

export type ReviewKycDocumentDto = z.infer<typeof ReviewKycDocumentSchema>;
