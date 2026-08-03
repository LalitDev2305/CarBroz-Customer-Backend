import { z } from 'zod';
import { KycDocumentStatus } from '@carbroz/common';
export declare const ReviewKycDocumentSchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPROVED: KycDocumentStatus.APPROVED;
        REJECTED: KycDocumentStatus.REJECTED;
    }>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ReviewKycDocumentDto = z.infer<typeof ReviewKycDocumentSchema>;
