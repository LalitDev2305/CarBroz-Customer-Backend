import { z } from 'zod';
import { KycDocumentType } from '@carbroz/foundation-kernel';
export const UploadKycDocumentSchema = z.object({
    type: z.nativeEnum(KycDocumentType),
});
//# sourceMappingURL=kyc.dto.js.map