import { z } from 'zod';
export declare const UploadKycDocumentSchema: z.ZodObject<{
    type: z.ZodEnum<any>;
}, z.core.$strip>;
export type UploadKycDocumentDto = z.infer<typeof UploadKycDocumentSchema>;
