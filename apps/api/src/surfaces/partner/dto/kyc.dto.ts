import { z } from 'zod';
import { KycDocumentType } from '@carbroz/domain-partner';

export const UploadKycDocumentSchema = z.object({
  type: z.nativeEnum(KycDocumentType),
});

export type UploadKycDocumentDto = z.infer<typeof UploadKycDocumentSchema>;
