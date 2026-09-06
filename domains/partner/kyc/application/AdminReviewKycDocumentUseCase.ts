import type { ExecutionContext, IUseCase } from '@carbroz/foundation-kernel';
import type { Partner } from '../../domain/Partner.js';
import { PartnerStatus } from '../../domain/PartnerStatus.js';
import type { IPartnerRepository } from '../../domain/repositories/IPartnerRepository.js';
import type { KycDocument } from '../domain/KycDocument.js';
import { KycDocumentStatus } from '../domain/KycDocumentStatus.js';
import type { IKycDocumentRepository } from '../domain/repositories/IKycDocumentRepository.js';

export interface AdminReviewKycDocumentInput {
  context: ExecutionContext;
  data: { documentId: number; action: 'APPROVE' | 'REJECT'; reason?: string };
}

export class AdminReviewKycDocumentUseCase implements IUseCase<AdminReviewKycDocumentInput, KycDocument> {
  constructor(
    private readonly kycDocumentRepository: IKycDocumentRepository,
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute({ context, data }: AdminReviewKycDocumentInput): Promise<KycDocument> {
    const actor = context.actor;
    const adminUserId = Number(actor.id);
    if (!Number.isInteger(adminUserId) || adminUserId <= 0 || (actor.kind !== 'ADMIN' && !actor.roles.includes('ADMIN'))) {
      throw new Error('UNAUTHORIZED: Admin must be logged in');
    }
    const status = data.action === 'APPROVE' ? KycDocumentStatus.APPROVED : KycDocumentStatus.REJECTED;
    if (status === KycDocumentStatus.REJECTED && !data.reason) throw new Error('BAD_REQUEST: Rejection reason is required');
    const document = await this.kycDocumentRepository.findById(data.documentId);
    if (!document) throw new Error('NOT_FOUND: KYC document not found');
    const updated = await this.kycDocumentRepository.updateStatus(
      data.documentId,
      status,
      adminUserId,
      status === KycDocumentStatus.REJECTED ? data.reason ?? null : null,
    );
    if (data.action === 'APPROVE') {
      const allDocs = await this.kycDocumentRepository.findByPartnerId(document.partnerId);
      const hasPending = allDocs.some((candidate) => candidate.status === KycDocumentStatus.PENDING);
      if (!hasPending) {
        const partner: Partner | null = await this.partnerRepository.findById(document.partnerId);
        if (partner) {
          partner.status = PartnerStatus.ACTIVE;
          await this.partnerRepository.save(partner);
        }
      }
    }
    return updated;
  }
}
