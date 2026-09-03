import { type KycDocument } from '../domain/KycDocument.js';
import { KycDocumentStatus } from '../domain/KycDocumentStatus.js';
import { type IKycDocumentRepository } from '../domain/repositories/IKycDocumentRepository.js';

export interface VerifyKycInput {
  documentId: number;
  adminUserId: number;
  approved: boolean;
  rejectionReason?: string;
}

export class VerifyPartnerKycDocumentUseCase {
  constructor(private readonly kycRepository: IKycDocumentRepository) {}

  public async execute(input: VerifyKycInput): Promise<KycDocument> {
    const document = await this.kycRepository.findById(input.documentId);
    if (!document) {
      throw new Error(`KYC Document with ID ${input.documentId} not found`);
    }

    const newStatus: KycDocumentStatus = input.approved
      ? ('APPROVED' as KycDocumentStatus)
      : ('REJECTED' as KycDocumentStatus);

    return this.kycRepository.updateStatus(
      input.documentId,
      newStatus,
      input.adminUserId,
      input.approved ? null : input.rejectionReason || 'Document verification failed',
    );
  }
}
