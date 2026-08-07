import { KycDocumentType } from '../enums/KycDocumentType.js';
import { KycDocumentStatus } from '../enums/KycDocumentStatus.js';

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
