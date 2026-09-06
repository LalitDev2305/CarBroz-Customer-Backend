import { KycDocumentType } from '@carbroz/domain-partner';
import { z } from 'zod';


export const UploadKycDocumentSchema = z.object({
  type: z.nativeEnum(KycDocumentType),
});

/** UploadKycDocumentDto is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export type UploadKycDocumentDto = z.infer<typeof UploadKycDocumentSchema>;
