import type { KycDocument } from '../KycDocument.js';
import type { KycDocumentStatus } from '../KycDocumentStatus.js';

export type NewKycDocument = Omit<KycDocument, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>;

export interface IKycDocumentRepository {
  findById(id: number): Promise<KycDocument | null>;
  findByPartnerId(partnerId: number): Promise<KycDocument[]>;
  findByPartnerIdAndStatus(partnerId: number, status: KycDocumentStatus): Promise<KycDocument[]>;
  create(document: NewKycDocument): Promise<KycDocument>;
  update(id: number, data: Partial<KycDocument>): Promise<KycDocument>;
  updateStatus(
    id: number,
    status: KycDocumentStatus,
    verifiedById: number,
    rejectionReason?: string | null,
  ): Promise<KycDocument>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<KycDocument[]>;
  save(document: KycDocument): Promise<KycDocument>;
}
