import type { KycDocumentStatus } from '../../domain/KycDocumentStatus.js';
import type { KycDocumentType } from '../../domain/KycDocumentType.js';

export interface KycPersistenceRecord {
  id: number;
  publicId: string;
  partnerId: number;
  type: string;
  fileUrl: string;
  status: string;
  rejectionReason: string | null;
  uploadedById: number;
  verifiedById: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface KycPersistenceClient {
  kycDocument: {
    findUnique(args: { where: { id: number } }): Promise<KycPersistenceRecord | null>;
    findMany(args?: { where?: { partnerId?: number; status?: KycDocumentStatus } }): Promise<KycPersistenceRecord[]>;
    create(args: {
      data: {
        partnerId: number;
        type: KycDocumentType;
        fileUrl: string;
        status: KycDocumentStatus;
        rejectionReason?: string | null;
        uploadedById: number;
        verifiedById?: number | null;
      };
    }): Promise<KycPersistenceRecord>;
    update(args: {
      where: { id: number };
      data: {
        type?: KycDocumentType;
        fileUrl?: string;
        status?: KycDocumentStatus;
        rejectionReason?: string | null;
        uploadedById?: number;
        verifiedById?: number | null;
      };
    }): Promise<KycPersistenceRecord>;
    delete(args: { where: { id: number } }): Promise<KycPersistenceRecord>;
  };
}
