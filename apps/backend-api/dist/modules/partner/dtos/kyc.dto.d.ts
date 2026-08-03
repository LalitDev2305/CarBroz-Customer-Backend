import { z } from 'zod';
import { KycDocumentType } from '@carbroz/common';
export declare const UploadKycDocumentSchema: z.ZodObject<{
    type: z.ZodEnum<typeof KycDocumentType>;
}, z.core.$strip>;
export type UploadKycDocumentDto = z.infer<typeof UploadKycDocumentSchema>;
