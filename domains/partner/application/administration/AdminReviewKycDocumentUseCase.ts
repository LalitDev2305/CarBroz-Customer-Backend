import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type IKycDocumentRepository } from '../../kyc/domain/repositories/IKycDocumentRepository.js';
import { KycDocumentStatus } from '../../kyc/domain/KycDocumentStatus.js';
import { type KycDocument } from '../../kyc/domain/KycDocument.js';
import { type IPartnerRepository } from '../../profile/domain/repositories/IPartnerRepository.js';
import { PartnerStatus } from '../../profile/domain/PartnerStatus.js';

export interface AdminReviewKycDocumentInput {
  context: IRequestContext;
  data: {
    documentId: number;
    action: 'APPROVE' | 'REJECT';
    reason?: string;
  }
}

export class AdminReviewKycDocumentUseCase implements IUseCase<AdminReviewKycDocumentInput, KycDocument> {
  constructor(
    private readonly kycDocumentRepository: IKycDocumentRepository,
    private readonly partnerRepository: IPartnerRepository
  ) {}

  async execute(request: AdminReviewKycDocumentInput): Promise<KycDocument> {
    const adminUserId = request.context.authenticatedUser?.id as number;
    if (!adminUserId) {
      throw new Error('UNAUTHORIZED: Admin must be logged in');
    }

    const status = request.data.action === 'APPROVE' ? KycDocumentStatus.APPROVED : KycDocumentStatus.REJECTED;

    if (status === KycDocumentStatus.REJECTED && !request.data.reason) {
      throw new Error('BAD_REQUEST: Rejection reason is required');
    }

    const document = await this.kycDocumentRepository.findById(request.data.documentId);
    if (!document) {
      throw new Error('NOT_FOUND: KYC document not found');
    }

    document.status = status;
    document.rejectionReason = request.data.reason || null;
    document.verifiedById = adminUserId;
    document.updatedAt = new Date();
    
    const updated = await this.kycDocumentRepository.save(document);

    if (request.data.action === 'APPROVE') {
      const allDocs = await this.kycDocumentRepository.findByPartnerId(document.partnerId);
      const hasPending = allDocs.some(d => d.status === KycDocumentStatus.PENDING);
      if (!hasPending) {
        const partner = await this.partnerRepository.findById(document.partnerId);
        if (partner) {
          partner.status = PartnerStatus.ACTIVE;
          await this.partnerRepository.save(partner);
        }
      }
    }

    return updated;
  }
}
