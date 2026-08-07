import { z } from 'zod';
export declare const ReviewKycDocumentSchema: z.ZodObject<{
    status: z.ZodEnum<{
        [x: string]: any;
    }>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ReviewKycDocumentDto = z.infer<typeof ReviewKycDocumentSchema>;
