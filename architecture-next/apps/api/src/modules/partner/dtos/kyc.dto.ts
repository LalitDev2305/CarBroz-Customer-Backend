import { z } from 'zod';
import { KycDocumentType } from '@carbroz/common';

export const UploadKycDocumentSchema = z.object({
  type: z.nativeEnum(KycDocumentType),
});

export type UploadKycDocumentDto = z.infer<typeof UploadKycDocumentSchema>;
