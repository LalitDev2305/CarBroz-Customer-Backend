import { type IUseCase, type IRequestContext } from '@carbroz/foundation-kernel';
import { type IStorageProvider } from '@carbroz/platform-storage';
import { type IKycDocumentRepository } from '../../kyc/domain/repositories/IKycDocumentRepository.js';
import { KycDocumentType } from '../../kyc/domain/KycDocumentType.js';
import { KycDocumentStatus } from '../../kyc/domain/KycDocumentStatus.js';
import { type IPartnerMemberRepository } from '../../profile/domain/repositories/IPartnerMemberRepository.js';
import crypto from 'crypto';

export interface UploadKycDocumentInput {
  context: IRequestContext;
  data: {
    partnerId: number;
    type: KycDocumentType;
    fileBuffer: Buffer;
    mimeType: string;
  }
}

export class UploadKycDocumentUseCase implements IUseCase<UploadKycDocumentInput, void> {
  constructor(
    private readonly storageProvider: IStorageProvider,
    private readonly kycDocumentRepository: IKycDocumentRepository,
    private readonly partnerMemberRepository: IPartnerMemberRepository
  ) {}

  async execute(request: UploadKycDocumentInput): Promise<void> {
    const userId = request.context.authenticatedUser?.id as number;
    if (!userId) {
      throw new Error('UNAUTHORIZED: User must be logged in');
    }

    // Verify user is a member of the partner (OWNER or MANAGER)
    const membership = await this.partnerMemberRepository.findByUserIdAndPartnerId(userId, request.data.partnerId);
    if (!membership || !['OWNER', 'MANAGER'].includes(membership.role)) {
      throw new Error('FORBIDDEN: Only owners or managers can upload KYC documents');
    }

    // Generate unique object name
    const fileId = crypto.randomUUID();
    const extension = request.data.mimeType === 'application/pdf' ? 'pdf' : (request.data.mimeType.split('/')[1] || 'bin');
    const objectName = `partner-${request.data.partnerId}/${request.data.type.toLowerCase()}-${fileId}.${extension}`;

    // Upload via Storage Provider
    const fileUrl = await this.storageProvider.uploadFile('kyc-documents', objectName, request.data.fileBuffer, request.data.mimeType);

    // Save to Database
    await this.kycDocumentRepository.create({
      partnerId: request.data.partnerId,
      type: request.data.type,
      fileUrl,
      status: KycDocumentStatus.PENDING,
      uploadedById: userId,
    });
  }
}
