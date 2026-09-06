import { KycDocumentType } from './KycDocumentType.js';
import { KycDocumentStatus } from './KycDocumentStatus.js';

/** KycDocument is an exported domains/partner contract/implementation; see the owning README for lifecycle and extension rules. */
export interface KycDocument {
  id: number;
  publicId: string;
  partnerId: number;
  type: KycDocumentType;
  fileUrl: string;
  status: KycDocumentStatus;
  rejectionReason?: string | null;
  uploadedById: number;
  verifiedById?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
