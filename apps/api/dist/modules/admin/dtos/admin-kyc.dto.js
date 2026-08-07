import { z } from 'zod';
import { KycDocumentStatus } from '@carbroz/foundation-kernel';
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
//# sourceMappingURL=admin-kyc.dto.js.map