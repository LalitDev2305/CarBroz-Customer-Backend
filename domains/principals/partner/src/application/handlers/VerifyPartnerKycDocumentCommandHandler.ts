import { KycDocument } from '../../domain/entities/KycDocument.js';
import { KycDocumentStatus } from '../../domain/enums/KycDocumentStatus.js';
import { PrismaKycDocumentRepository } from '../../infrastructure/persistence/prisma/PrismaKycDocumentRepository.js';


export interface VerifyKycInput {
  documentId: number;
  adminUserId: number;
  approved: boolean;
  rejectionReason?: string;
}

export class VerifyPartnerKycDocumentCommandHandler {
  constructor(private readonly kycRepository: PrismaKycDocumentRepository) {}

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
      input.approved ? null : input.rejectionReason || 'Document verification failed'
    );
  }
}
