import { KycDocument } from '../KycDocument.js';
import { KycDocumentStatus } from '../KycDocumentStatus.js';
import { IRepository } from '../IRepository.js';

export interface IKycDocumentRepository extends IRepository<KycDocument, number> {
  findByPartnerId(partnerId: number): Promise<KycDocument[]>;
  findByPartnerIdAndStatus(partnerId: number, status: KycDocumentStatus): Promise<KycDocument[]>;
  create(document: Omit<KycDocument, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<KycDocument>;
  updateStatus(id: number, status: KycDocumentStatus, verifiedById: number, rejectionReason?: string | null): Promise<KycDocument>;
}
